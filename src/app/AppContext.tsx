import { ComponentChildren, createContext } from "preact";
import { useEffect, useState } from "preact/hooks";

const STORAGE_KEY = "manual-sort-data";

export type SortItem = {
  uuid: string;
  value: string;
  relations: {
    uuidsBefore: string[];
    uuidsAfter: string[];
  };
};

type ManualSortData = {
  items: SortItem[];
};

type ManualSortContext = {
  data: ManualSortData;
  setData: (data: ManualSortData) => void;
  addItem: (item: string) => void;
  addItems: (items: string[]) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, value: string) => void;
};

export const AppContext = createContext<ManualSortContext>({
  data: { items: [] },
  setData: () => {},
  addItem: () => {},
  addItems: () => {},
  removeItem: () => {},
  updateItem: () => {},
});

export const AppProvider = ({ children }: { children: ComponentChildren }) => {
  const [data, setData] = useState<ManualSortData>({
    items: [],
  });

  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData || JSON.parse(storedData).items.length === 0) {
      addItems(["Cats", "Dogs", "Birds", "Rabbits", "Horses"]);
    } else {
      setData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Function to add a new item to the list
  const addItem = (item: string) => {
    setData({
      ...data,
      items: [...data.items, {
        uuid: crypto.randomUUID(),
        value: item,
        relations: { uuidsBefore: [], uuidsAfter: [] },
      }],
    });
  };

  const addItems = (items: string[]) => {
    setData({
      ...data,
      items: [
        ...data.items,
        ...items.map((item) => ({
          uuid: crypto.randomUUID(),
          value: item,
          relations: { uuidsBefore: [], uuidsAfter: [] },
        })),
      ],
    });
  };

  const removeItem = (index: number) => {
    setData({
      ...data,
      items: [...data.items.slice(0, index), ...data.items.slice(index + 1)],
    });
  };

  const updateItem = (index: number, newValue: string) => {
    setData({
      ...data,
      items: [
        ...data.items.slice(0, index),
        { ...data.items[index], value: newValue },
        ...data.items.slice(index + 1),
      ],
    });
  };

  return (
    <AppContext.Provider
      value={{ data, setData, addItem, addItems, removeItem, updateItem }}
    >
      {children}
    </AppContext.Provider>
  );
};
