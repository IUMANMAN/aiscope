import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function versionCommand() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
  const packageJson = JSON.parse(await fs.promises.readFile(path.join(root, "package.json"), "utf8"));
  console.log(packageJson.version);
}
