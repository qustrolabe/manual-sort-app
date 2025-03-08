import { assertEquals } from "jsr:@std/assert";
import { SortItem } from "./AppContext.tsx";
import {
    StepType,
    initializeSort,
    findNextCompare,
    partition,
    advanceSort,
} from "./quickSortLogic.ts";

/** Creates a SortItem with a unique UUID. */
function createItem(value: string): SortItem {
    return {
        uuid: crypto.randomUUID(),
        value,
        relations: { uuidsBefore: [], uuidsAfter: [] },
    };
}

Deno.test("initializeSort - empty array", () => {
    const state = initializeSort([]);
    assertEquals(state.stepType, StepType.Done);
    assertEquals(state.items.length, 0);
    assertEquals(state.right, -1);
});

Deno.test("initializeSort - single item", () => {
    const items = [createItem("A")];
    const state = initializeSort(items);
    assertEquals(state.stepType, StepType.Done);
    assertEquals(state.items.length, 1);
    assertEquals(state.partitionStack.length, 0);
});

Deno.test("initializeSort - multiple items", () => {
    const items = [createItem("B"), createItem("A"), createItem("C")];
    const state = initializeSort(items);
    assertEquals(state.stepType, StepType.ChoosingPivot);
    assertEquals(state.left, 0);
    assertEquals(state.right, 2);
    assertEquals(state.pivotIdx, 1);
    assertEquals(state.compareIdx, 0);
});

Deno.test("findNextCompare - no relations", () => {
    const items = [createItem("B"), createItem("A"), createItem("C")];
    const result = findNextCompare(items, 0, 2, 1);
    assertEquals(result, 0);
});

Deno.test("findNextCompare - all related", () => {
    const items = [createItem("B"), createItem("A"), createItem("C")];
    items[0].relations.uuidsAfter.push(items[1].uuid); // B > A
    items[2].relations.uuidsBefore.push(items[1].uuid); // C < A
    const result = findNextCompare(items, 0, 2, 1);
    assertEquals(result, -1);
});

Deno.test("partition - simple case", () => {
    const items = [createItem("B"), createItem("A"), createItem("C")];
    items[0].relations.uuidsBefore.push(items[1].uuid); // B has A < B
    items[1].relations.uuidsAfter.push(items[0].uuid);  // A has B > A
    items[1].relations.uuidsBefore.push(items[2].uuid); // A has C < A
    items[2].relations.uuidsAfter.push(items[1].uuid);  // C has A > C

    const finalPivotIdx = partition(items, 0, 2, 1);
    assertEquals(finalPivotIdx, 1);
    assertEquals(items.map((item) => item.value), ["C", "A", "B"]);
});

Deno.test("advanceSort - comparison step", () => {
    const items = [createItem("B"), createItem("A"), createItem("C")];
    const initialState = initializeSort(items);
    const nextState = advanceSort(initialState, true); // B > A
    assertEquals(nextState.stepType, StepType.ChoosingPivot);
    assertEquals(nextState.compareIdx, 2);
    assertEquals(nextState.items[0].relations.uuidsAfter[0], items[1].uuid);
    assertEquals(nextState.items[1].relations.uuidsBefore[0], items[0].uuid);
});

Deno.test("advanceSort - completes sorting", () => {
    const items = [createItem("B"), createItem("A")];
    let state = initializeSort(items);
    state = advanceSort(state, true); // B > A
    assertEquals(state.stepType, StepType.Done);
    assertEquals(state.items.map((item) => item.value), ["A", "B"]);
    assertEquals(state.items[0].relations.uuidsAfter[0], items[0].uuid);
    assertEquals(state.items[1].relations.uuidsBefore[0], items[1].uuid);
});

Deno.test("partition - multiple relations with larger array", () => {
    const items = [
        createItem("D"),
        createItem("B"),
        createItem("A"),
        createItem("E"),
        createItem("C"),
    ];
    // Relations: D > B, B > A, E > A, C < E, C < B
    items[0].relations.uuidsBefore.push(items[1].uuid); // D > B
    items[1].relations.uuidsAfter.push(items[0].uuid);  // B < D
    items[1].relations.uuidsBefore.push(items[2].uuid); // B > A
    items[2].relations.uuidsAfter.push(items[1].uuid);  // A < B
    items[3].relations.uuidsBefore.push(items[2].uuid); // E > A
    items[2].relations.uuidsAfter.push(items[3].uuid);  // A < E
    items[4].relations.uuidsAfter.push(items[3].uuid);  // C < E
    items[3].relations.uuidsBefore.push(items[4].uuid); // E > C
    items[4].relations.uuidsAfter.push(items[1].uuid);  // C < B
    items[1].relations.uuidsBefore.push(items[4].uuid); // B > C

    const finalPivotIdx = partition(items, 0, 4, 2); // Pivot at "A" (index 2)
    assertEquals(finalPivotIdx, 0); // A should end up at the start
    assertEquals(items.map((item) => item.value), ["A", "B", "C", "E", "D"]);
});

Deno.test("partition - shuffled numeric strings comparison", () => {
    const items = Array.from({ length: 10 }, (_, i) => createItem((i + 1).toString()));
    // Shuffle using sort and random
    items.sort(() => Math.random() - 0.5);

    // Simulate comparisons by converting strings to numbers
    const compareNumericValues = (a: SortItem, b: SortItem): boolean => {
        return parseInt(a.value) > parseInt(b.value);
    };

    // Initialize sort
    let state = initializeSort(items);

    while (state.stepType !== StepType.Done) {
        const pivotItem = state.items[state.pivotIdx];
        const compareItem = state.items[state.compareIdx];
        const pivotIsBigger = compareNumericValues(pivotItem, compareItem);
        state = advanceSort(state, pivotIsBigger);
    }

    // Assert final order
    assertEquals(state.items.map((item) => item.value), ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
});
