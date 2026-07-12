import { defineConfig } from "tsup";
import { cp } from "node:fs/promises";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  external: ["react", "react-dom", "react/jsx-runtime"],
  onSuccess: async () => {
    await cp("src/styles.css", "dist/styles.css");
  },
});
