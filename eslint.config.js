import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  { ignores: ["dist", "demo/dist", "site/dist", "coverage", "node_modules", "playwright-report", "test-results"] },
);
