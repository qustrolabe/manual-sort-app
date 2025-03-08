import { SortItem } from "./AppContext.tsx";

export enum StepType {
    ChoosingPivot = "CHOOSING_PIVOT",
    Done = "DONE",
}

export interface QuickSortState {
    items: SortItem[];
    left: number;
    right: number;
    pivotIdx: number;
    compareIdx: number;
    stepType: StepType;
    partitionStack: [number, number][];
}

const logger = {
    info: (...args: any[]) => console.log("[INFO]", ...args),
    debug: (...args: any[]) => console.debug("[DEBUG]", ...args),
    error: (...args: any[]) => console.error("[ERROR]", ...args),
};

/**
 * Finds the next index to compare with the pivot that has no established relation.
 * Returns -1 if no further comparisons are needed in the current partition.
 */
export function findNextCompare(
    items: SortItem[],
    left: number,
    right: number,
    pivotIdx: number,
): number {
    for (let i = left; i <= right; i++) {
        if (
            i !== pivotIdx &&
            !items[i].relations.uuidsAfter.includes(items[pivotIdx].uuid) &&
            !items[i].relations.uuidsBefore.includes(items[pivotIdx].uuid) &&
            !items[pivotIdx].relations.uuidsAfter.includes(items[i].uuid) &&
            !items[pivotIdx].relations.uuidsBefore.includes(items[i].uuid)
        ) {
            logger.debug("Next compare index", i);
            return i;
        }
    }
    logger.debug("No more comparisons needed");
    return -1;
}

/**
 * Initializes the sorting state for QuickSort.
 * Returns a Done state for arrays with 0 or 1 items.
 */
export function initializeSort(items: SortItem[]): QuickSortState {
    if (items.length === 0) {
        return {
            items: [],
            left: 0,
            right: -1,
            pivotIdx: 0,
            compareIdx: 0,
            stepType: StepType.Done,
            partitionStack: [],
        };
    }
    if (items.length === 1) {
        return {
            items: [...items],
            left: 0,
            right: 0,
            pivotIdx: 0,
            compareIdx: 0,
            stepType: StepType.Done,
            partitionStack: [],
        };
    }

    const left = 0;
    const right = items.length - 1;
    const pivotIdx = Math.floor((left + right) / 2);
    const compareIdx = findNextCompare([...items], left, right, pivotIdx);

    logger.info("Starting sort", { left, right, pivotIdx });
    return {
        items: [...items],
        left,
        right,
        pivotIdx,
        compareIdx: compareIdx === -1 ? left : compareIdx,
        stepType: StepType.ChoosingPivot,
        partitionStack: [],
    };
}

/**
 * Partitions the array around the pivot based on existing relations.
 * Returns the final index of the pivot.
 */
export function partition(
    items: SortItem[],
    left: number,
    right: number,
    pivotIdx: number,
): number {
    const pivotItem = items[pivotIdx];
    logger.info("Partitioning", { left, right, pivot: pivotItem.value });

    // Move pivot to the end
    [items[pivotIdx], items[right]] = [items[right], items[pivotIdx]];
    let storeIdx = left;

    for (let i = left; i < right; i++) {
        if (
            pivotItem.relations.uuidsBefore.includes(items[i].uuid) ||
            items[i].relations.uuidsAfter.includes(pivotItem.uuid)
        ) {
            [items[i], items[storeIdx]] = [items[storeIdx], items[i]];
            storeIdx++;
        }
    }

    // Move pivot to final position
    [items[right], items[storeIdx]] = [items[storeIdx], items[right]];
    logger.debug("Partitioned", {
        pivotFinal: storeIdx,
        items: items.map((item) => item.value),
    });
    return storeIdx;
}

/**
 * Checks if the partition is fully ordered based on relations.
 */
function isPartitionFullyOrdered(items: SortItem[], left: number, right: number): boolean {
    for (let i = left; i < right; i++) {
        for (let j = i + 1; j <= right; j++) {
            if (
                !items[i].relations.uuidsAfter.includes(items[j].uuid) &&
                !items[j].relations.uuidsBefore.includes(items[i].uuid)
            ) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Transitions to the next partition or completes the sort.
 */
function transitionToNextPartition(
    items: SortItem[],
    finalPivotIdx: number,
    left: number,
    right: number,
    partitionStack: [number, number][],
): QuickSortState {
    const newStack = [...partitionStack];
    if (finalPivotIdx + 1 < right) {
        newStack.push([finalPivotIdx + 1, right]);
    }

    if (left < finalPivotIdx - 1) {
        const nextLeft = left;
        const nextRight = finalPivotIdx - 1;
        const nextPivot = Math.floor((nextLeft + nextRight) / 2);
        const nextCompareIdx = findNextCompare(items, nextLeft, nextRight, nextPivot);

        logger.info("Moving to left partition", { nextLeft, nextRight, nextPivot });
        return {
            items,
            left: nextLeft,
            right: nextRight,
            pivotIdx: nextPivot,
            compareIdx: nextCompareIdx === -1 ? nextLeft : nextCompareIdx,
            stepType: StepType.ChoosingPivot,
            partitionStack: newStack,
        };
    } else if (newStack.length > 0) {
        const [nextLeft, nextRight] = newStack.pop()!;
        const nextPivot = Math.floor((nextLeft + nextRight) / 2);
        const nextCompareIdx = findNextCompare(items, nextLeft, nextRight, nextPivot);

        logger.info("Moving to next partition", { nextLeft, nextRight, nextPivot });
        return {
            items,
            left: nextLeft,
            right: nextRight,
            pivotIdx: nextPivot,
            compareIdx: nextCompareIdx === -1 ? nextLeft : nextCompareIdx,
            stepType: StepType.ChoosingPivot,
            partitionStack: newStack,
        };
    } else {
        logger.info("Sorting completed");
        return {
            items,
            left: 0,
            right: items.length - 1,
            pivotIdx: 0,
            compareIdx: 0,
            stepType: StepType.Done,
            partitionStack: [],
        };
    }
}


/**
 * Advances the QuickSort state based on user comparison input.
 */
export function advanceSort(state: QuickSortState, pivotIsBigger: boolean): QuickSortState {
    if (state.stepType === StepType.Done) {
        logger.error("Invalid state", state);
        return state;
    }

    const { items, pivotIdx, compareIdx, left, right, partitionStack } = state;
    const newItems = [...items];
    const pivotItem = newItems[pivotIdx];
    const compareItem = newItems[compareIdx];

    logger.info("Pivot choice", {
        pivot: pivotItem.value,
        compare: compareItem.value,
        pivotIsBigger,
    });

    // Update relations
    if (pivotIsBigger) {
        pivotItem.relations.uuidsBefore.push(compareItem.uuid);
        compareItem.relations.uuidsAfter.push(pivotItem.uuid);
    } else {
        pivotItem.relations.uuidsAfter.push(compareItem.uuid);
        compareItem.relations.uuidsBefore.push(pivotItem.uuid);
    }

    const nextCompare = findNextCompare(newItems, left, right, pivotIdx);
    if (nextCompare === -1) {
        if (isPartitionFullyOrdered(newItems, left, right)) {
            // Sort the newItems array before returning the updated state
            newItems.sort((a, b) => {
                if (a.relations.uuidsBefore.includes(b.uuid)) return 1;
                if (a.relations.uuidsAfter.includes(b.uuid)) return -1;
                return 0;  // If no explicit relation, keep the current order
            });

            return partitionStack.length > 0
                ? transitionToNextPartition(newItems, pivotIdx, left, right, partitionStack)
                : {
                    items: newItems,
                    left: 0,
                    right: newItems.length - 1,
                    pivotIdx: 0,
                    compareIdx: 0,
                    stepType: StepType.Done,
                    partitionStack: [],
                };
        }

        const finalPivotIdx = partition(newItems, left, right, pivotIdx);
        return transitionToNextPartition(newItems, finalPivotIdx, left, right, partitionStack);
    }

    return { ...state, items: newItems, compareIdx: nextCompare };
}