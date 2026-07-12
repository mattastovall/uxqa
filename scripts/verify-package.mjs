import { rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import process from "node:process";

const requiredFiles = new Set([
  "LICENSE",
  "README.md",
  "dist/index.cjs",
  "dist/index.d.cts",
  "dist/index.d.ts",
  "dist/index.js",
  "dist/styles.css",
  "package.json",
]);

const forbiddenRoots = ["src/", "tests/", "e2e/", "demo/", ".github/", "docs/"];

function pack() {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["pack", "--json"], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "inherit"],
    });
    let stdout = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.on("error", reject);
    child.on("close", (code) => code === 0
      ? resolve(stdout)
      : reject(new Error(`npm pack exited with status ${code}`)));
  });
}

let filename;
try {
  const result = JSON.parse(await pack());
  if (!Array.isArray(result) || result.length !== 1) {
    throw new Error("npm pack did not return exactly one package");
  }

  const packed = result[0];
  filename = packed.filename;
  const files = new Set(packed.files.map(({ path }) => path));
  const missing = [...requiredFiles].filter((path) => !files.has(path));
  const leaked = [...files].filter((path) => forbiddenRoots.some((root) => path.startsWith(root)));
  const unexpected = [...files].filter((path) => !requiredFiles.has(path));

  if (missing.length > 0) throw new Error(`Missing required package files: ${missing.join(", ")}`);
  if (leaked.length > 0) throw new Error(`Private project files leaked into package: ${leaked.join(", ")}`);
  if (unexpected.length > 0) throw new Error(`Unexpected package files: ${unexpected.join(", ")}`);

  process.stdout.write(`Verified ${filename}: ${packed.unpackedSize} bytes unpacked, ${files.size} files\n`);
} finally {
  if (filename) await rm(filename, { force: true });
}
