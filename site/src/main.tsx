import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "uxqa/styles.css";
import { App } from "./App.js";
import "./site.css";

const root = document.getElementById("root");
if (root === null) throw new Error("Missing #root element");

createRoot(root).render(<StrictMode><App /></StrictMode>);
