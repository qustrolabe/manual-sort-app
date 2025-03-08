import "./index.css";
import { hydrate, prerender as ssr } from "preact-iso";
import { App } from "./app/App.tsx";

if (typeof window !== "undefined") {
  hydrate(<App />, document.getElementById("app") as HTMLElement);
}

export async function prerender(_data: unknown) {
  return await ssr(<App />);
}
