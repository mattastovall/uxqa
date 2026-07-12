import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App, EmbeddedPage } from "./App";
import "uxqa/styles.css";
import "./demo.css";

const root = document.getElementById("root");

if (!root) throw new Error("Demo root element is missing");

createRoot(root).render(
  <StrictMode>
    {new URLSearchParams(window.location.search).has("embedded") ? <EmbeddedPage /> : <App />}
  </StrictMode>,
);
