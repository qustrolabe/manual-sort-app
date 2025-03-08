import { useContext } from "preact/hooks";
import { AppContext } from "../AppContext.tsx";

import SidebarItem from "./SidebarItem.tsx";

export function Sidebar() {
  const { data, updateItem, removeItem } = useContext(AppContext);

  return (
    <div class="p-4 md:p-6 overflow-y-auto">
      <div class="flex flex-col space-y-2">
        {[...data.items].reverse().map((item, i) => (
          <SidebarItem
            key={data.items.length - 1 - i}
            item={item}
            index={data.items.length - 1 - i}
            handleRemoveItem={removeItem}
            handleUpdateItem={updateItem}
          />
        ))}
      </div>
    </div>
  );
}
