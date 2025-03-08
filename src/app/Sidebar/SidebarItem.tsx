import { useEffect, useState } from "preact/hooks";
import { SortItem } from "../AppContext.tsx";

type SidebarItemProps = {
  item: SortItem;
  index: number;
  handleRemoveItem: (index: number) => void;
  handleUpdateItem: (index: number, value: string) => void;
};

export default function SidebarItem(
  { item, index, handleRemoveItem, handleUpdateItem }: SidebarItemProps,
) {
  const [isEditing, setIsEditing] = useState(false);

  const [inputValue, setInputValue] = useState(item.value);

  useEffect(() => {
    setInputValue(item.value);
  }, [item.value]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    handleUpdateItem(index, inputValue);
  };

  return (
    <div class="flex items-center p-2 border-b border-gray-300 last:border-b-0">
      <div class="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white text-center w-12 text-base px-3 py-1 rounded-full shadow-md">
        {index + 1}
      </div>
      <div class="flex-1 ml-2">
        <div
          class="bg-gray-100 p-2 w-full rounded-lg"
          style={{ height: "2.5rem" }}
          onDblClick={handleDoubleClick}
        >
          {isEditing
            ? (
              <input
                type="text"
                value={inputValue}
                onInput={(e) =>
                  setInputValue((e.target as HTMLInputElement).value)}
                onBlur={handleBlur}
                onKeyDown={(e) => e.key === "Enter" && handleBlur()}
                class="border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )
            : <div class="flex-1 font-bold">{item.value}</div>}
        </div>
      </div>
      <button
        type="button"
        onClick={() => handleRemoveItem(index)}
        class="text-red-500 hover:underline ml-2"
      >
        Remove
      </button>
    </div>
  );
}
