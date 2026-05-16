import fs from "node:fs";
import path from "node:path";
import { currentScope } from "../core/scope.js";
import { displayPath } from "../core/paths.js";

export async function linkCommand(args) {
  const { fileName, force } = parseArgs(args);
  validateLocalEnvFileName(fileName);

  const scope = await currentScope();
  if (!scope) {
    throw new Error("missing .aiscope.toml. Run aiscope init project <name> or aiscope init skill <name> first.");
  }

  const linkPath = path.resolve(process.cwd(), fileName);
  const result = await ensureLinkable(linkPath, scope.envPath, force);
  if (result === "already-linked") {
    console.log(`aiscope: ${fileName} already links to this scope`);
    console.log(`target: ${displayPath(scope.envPath)}`);
    return;
  }

  await fs.promises.symlink(scope.envPath, linkPath);

  console.log(`aiscope: linked ${fileName}`);
  console.log(`target: ${displayPath(scope.envPath)}`);
  console.log("");
  console.log("Use it like a normal local env file:");
  console.log(`  ${fileName}`);
  console.log("");
  console.log(`Do not commit ${fileName}. Add it to .gitignore if needed.`);
}

function parseArgs(args) {
  let fileName = ".env.local";
  let force = false;

  for (const arg of args) {
    if (arg === "--force" || arg === "-f") {
      force = true;
    } else {
      fileName = arg;
    }
  }

  return { fileName, force };
}

function validateLocalEnvFileName(fileName) {
  if (!fileName || fileName.includes("/") || fileName.includes("\\") || fileName === "." || fileName === "..") {
    throw new Error("invalid env link name. Use a local filename like .env.local or .dev.vars.");
  }
}

async function ensureLinkable(linkPath, targetPath, force) {
  let stat;
  try {
    stat = await fs.promises.lstat(linkPath);
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }

  if (stat.isSymbolicLink()) {
    const existingTarget = await fs.promises.readlink(linkPath);
    const resolvedExisting = path.resolve(path.dirname(linkPath), existingTarget);
    if (resolvedExisting === targetPath) {
      return "already-linked";
    }

    if (force) {
      await fs.promises.unlink(linkPath);
      return "removed";
    }
  }

  throw new Error(`${path.basename(linkPath)} already exists. Remove it first, or use aiscope link --force to replace an existing symlink.`);
}
