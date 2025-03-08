import { useContext, useState } from "preact/hooks";
import { AppContext } from "./AppContext.tsx";

export function ItemsInput() {
  return (
    <div class="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md">
      <SingleItemAddition />
      <ListItemAddition />
      <DebugButtons />
    </div>
  );
}

function SingleItemAddition() {
  const { addItem } = useContext(AppContext);

  const [inputValue, setInputValue] = useState("");

  const handleAddItem = () => {
    if (inputValue.trim()) {
      addItem(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddItem();
    }
  };

  return (
    <div class="flex items-center">
      <input
        type="text"
        value={inputValue}
        onInput={(e) => setInputValue((e.target as HTMLInputElement).value)}
        placeholder="Add a new item"
        class="border p-2 rounded-lg w-full"
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        onClick={handleAddItem}
        class="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Add
      </button>
    </div>
  );
}

function ListItemAddition() {
  const { addItems } = useContext(AppContext);

  const [inputValue, setInputValue] = useState("");

  const handleAddItems = () => {
    const newItems = inputValue
      .trim()
      .split(",")
      .map((x) => x.trim())
      .filter((x) => x);

    if (newItems.length) {
      addItems(newItems);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddItems();
    }
  };

  return (
    <div class="flex items-center">
      <input
        type="text"
        value={inputValue}
        onInput={(e) => setInputValue((e.target as HTMLInputElement).value)}
        placeholder="Add multiple items (separated by comma)"
        class="border p-2 rounded-lg w-full"
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        onClick={handleAddItems}
        class="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Add
      </button>
    </div>
  );
}

function DebugButtons() {
  const { data, setData, addItem } = useContext(AppContext);

  return (
    <div class="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setData({ items: [] })}
        class="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Clear Items
      </button>
    </div>
  );
}
