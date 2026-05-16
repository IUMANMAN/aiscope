import fs from "node:fs";
import path from "node:path";
import { CONFIG_FILE, configText, findConfig, readConfig } from "./config.js";
import { displayPath, envFilePath, logsDir, scopeDocPath } from "./paths.js";
import { validateScopeName, validateScopeType } from "./utils.js";
import { writeEnvFileIfMissing } from "./env.js";

export async function createScope(type, name, cwd = process.cwd()) {
  validateScopeType(type);
  validateScopeName(name);

  const configPath = path.join(cwd, CONFIG_FILE);
  const envPath = envFilePath(type, name);
  const docPath = scopeDocPath(type, name);

  await fs.promises.mkdir(path.dirname(envPath), { recursive: true });
  await fs.promises.mkdir(path.dirname(docPath), { recursive: true });
  await fs.promises.mkdir(logsDir(), { recursive: true });

  try {
    await fs.promises.writeFile(configPath, configText(type, name, displayPath(envPath)), { flag: "wx" });
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(".aiscope.toml already exists in this folder.");
    }
    throw error;
  }
  await writeEnvFileIfMissing(envPath);
  await writeScopeDocIfMissing(docPath, type, name);

  return { type, name, configPath, envPath, docPath };
}

export async function useProjectScope(name, cwd = process.cwd()) {
  const existing = await currentScope(cwd);
  if (existing) {
    if (existing.type === "project" && existing.name === name) return { ...existing, reused: true };
    throw new Error(`this folder already uses ${existing.type}/${existing.name}.`);
  }

  return createScope("project", name, cwd);
}

export async function createSharedScope(name) {
  validateScopeName(name);
  const envPath = envFilePath("shared", name);
  const docPath = scopeDocPath("shared", name);

  await fs.promises.mkdir(path.dirname(envPath), { recursive: true });
  await fs.promises.mkdir(path.dirname(docPath), { recursive: true });
  await fs.promises.mkdir(logsDir(), { recursive: true });
  await writeEnvFileIfMissing(envPath);
  await writeScopeDocIfMissing(docPath, "shared", name);

  return { type: "shared", name, envPath, docPath };
}

export async function attachSharedScope(name, cwd = process.cwd()) {
  validateScopeName(name);
  const scope = await currentScope(cwd);
  if (!scope) throw new Error("missing .aiscope.toml. Run aiscope use <name> first.");

  await createSharedScope(name);
  const sharedNames = scope.shared.map((item) => item.name);
  if (!sharedNames.includes(name)) sharedNames.push(name);
  await fs.promises.writeFile(scope.configPath, configText(scope.type, scope.name, displayPath(scope.envPath), sharedNames));
  return { ...scope, sharedNames };
}

export async function detachSharedScope(name, cwd = process.cwd()) {
  validateScopeName(name);
  const scope = await currentScope(cwd);
  if (!scope) throw new Error("missing .aiscope.toml. Run aiscope use <name> first.");

  const sharedNames = scope.shared.map((item) => item.name).filter((item) => item !== name);
  await fs.promises.writeFile(scope.configPath, configText(scope.type, scope.name, displayPath(scope.envPath), sharedNames));
  return { ...scope, sharedNames };
}

async function writeScopeDocIfMissing(docPath, type, name) {
  const title = `${type}/${name}`;
  const body = `# ${title}\n\nLocal notes for this aiscope scope.\n\nSecrets belong in the matching vault env file, not in this document.\n`;
  try {
    await fs.promises.writeFile(docPath, body, { flag: "wx" });
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
  }
}

export async function currentScope(cwd = process.cwd()) {
  const configPath = await findConfig(cwd);
  if (!configPath) return null;
  return readConfig(configPath);
}
