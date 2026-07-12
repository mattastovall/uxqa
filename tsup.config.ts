import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/profiles.ts", "src/scroll.ts", "src/scale.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
});
