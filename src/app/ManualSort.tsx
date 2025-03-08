import { useContext, useState } from "preact/hooks";
import { AppContext } from "./AppContext.tsx";
import { SortItem } from "./AppContext.tsx";
import {
  advanceSort,
  initializeSort,
  QuickSortState,
  StepType,
} from "./quickSortLogic.ts";

interface AppContextType {
  data: { items: SortItem[] };
  setData: (data: { items: SortItem[] }) => void;
}

export function ManualSort() {
  const { data, setData } = useContext(AppContext);
  const [sortState, setSortState] = useState<QuickSortState | null>(null);

  const startSort = () => {
    const newItems = data.items.map((item) => ({
      ...item,
      relations: { uuidsBefore: [], uuidsAfter: [] },
    }));
    setData({ items: newItems });
    const initialState = initializeSort(newItems);
    setSortState(initialState);
  };

  const handlePivotChoice = (pivotIsBigger: boolean) => {
    if (!sortState) return;
    const nextState = advanceSort(sortState, pivotIsBigger);
    setSortState(nextState);
    if (nextState.stepType === StepType.Done) {
      setData({ items: nextState.items });
      setSortState(null); // Reset the sort state
    }
  };

  return (
    <div class="flex flex-col gap-4 bg-white p-4 rounded-lg shadow-md">
      <button
        type="button"
        onClick={startSort}
        disabled={sortState?.stepType === StepType.Done ||
          data.items.length === 0}
        class="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition duration-300 ease-in-out"
      >
        {sortState ? "Sorting" : "Start Sorting"}
      </button>

      {sortState?.stepType === StepType.ChoosingPivot && (
        <div class="grid grid-cols-[1fr_auto_1fr] gap-4">
          <div class="flex flex-col items-start">
            <label class="text-lg font-bold">Left</label>
            <input
              type="text"
              value={sortState.items[sortState.pivotIdx].value}
              readOnly
              class="border px-2 py-1 w-full rounded-md"
            />
            <button
              type="button"
              onClick={() => handlePivotChoice(true)}
              class="bg-green-500 hover:bg-green-700 text-white w-full px-4 py-2 mt-2 rounded-full transition duration-300 ease-in-out"
            >
              Left is bigger
            </button>
          </div>
          <div class="flex items-center justify-center">
            <div class="text-4xl font-bold">Vs</div>
          </div>
          <div class="flex flex-col items-start">
            <label class="text-lg font-bold">Right</label>
            <input
              type="text"
              value={sortState.items[sortState.compareIdx].value}
              readOnly
              class="border px-2 py-1 w-full rounded-md"
            />
            <button
              type="button"
              onClick={() => handlePivotChoice(false)}
              class="bg-red-500 hover:bg-red-700 text-white w-full px-4 py-2 mt-2 rounded-full transition duration-300 ease-in-out"
            >
              Right is bigger
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
