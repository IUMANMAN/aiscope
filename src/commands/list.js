import fs from "node:fs";
import path from "node:path";
import { aiscopeHome } from "../core/paths.js";

export async function listCommand() {
  const projects = await listNames(path.join(aiscopeHome(), "vault", "projects"));
  const skills = await listNames(path.join(aiscopeHome(), "vault", "skills"));

  console.log("Projects:");
  printList(projects);
  console.log("");
  console.log("Skills:");
  printList(skills);
}

async function listNames(dir) {
  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".env"))
      .map((entry) => entry.name.slice(0, -4))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

function printList(items) {
  if (items.length === 0) {
    console.log("  (none)");
    return;
  }
  for (const item of items) console.log(`  - ${item}`);
}
