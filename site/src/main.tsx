import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./site.css";

const root = document.getElementById("root");
if (root === null) throw new Error("Missing #root element");

const isEditorRoute = window.location.pathname.split("/").filter(Boolean).at(-1) === "uxqa-editor";
const Page = lazy(
  isEditorRoute
    ? () => import("./EditorPage.js").then(({ EditorPage }) => ({ default: EditorPage }))
    : () => import("./App.js").then(({ App }) => ({ default: App })),
);

createRoot(root).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  </StrictMode>,
);
