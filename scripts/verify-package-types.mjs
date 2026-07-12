import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";

function runTsc(cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(join(process.cwd(), "node_modules/.bin/tsc"), ["--project", "tsconfig.json"], { cwd, stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`Type consumer check exited with status ${code}`)));
  });
}

const directory = await mkdtemp(join(tmpdir(), "uxqa-types-"));
try {
  await mkdir(join(directory, "node_modules"));
  await symlink(process.cwd(), join(directory, "node_modules/uxqa"), "dir");
  await writeFile(join(directory, "import-consumer.mts"), 'import { resolveSimulatorSelection } from "uxqa";\nresolveSimulatorSelection({ deviceId: "pixel" });\n');
  await writeFile(join(directory, "require-consumer.cts"), 'import uxqa = require("uxqa");\nuxqa.resolveSimulatorSelection({ browserId: "chrome" });\n');
  await writeFile(join(directory, "tsconfig.json"), JSON.stringify({
    compilerOptions: { module: "Node16", moduleResolution: "Node16", strict: true, noEmit: true, skipLibCheck: true },
    files: ["import-consumer.mts", "require-consumer.cts"],
  }));
  await runTsc(directory);
  process.stdout.write("Verified Node16 import and require type consumers\n");
} finally {
  await rm(directory, { recursive: true, force: true });
}
