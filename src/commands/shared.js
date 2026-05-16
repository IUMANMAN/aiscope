import fs from "node:fs";
import path from "node:path";
import { readEnvFile, setEnvValue, unsetEnvValue } from "../core/env.js";
import { attachSharedScope, createSharedScope, currentScope, detachSharedScope } from "../core/scope.js";
import { envFilePath, vaultDir } from "../core/paths.js";
import { maskValue, validateScopeName } from "../core/utils.js";

export async function sharedCommand(args) {
  const [action, ...rest] = args;

  if (!action) {
    await listSharedScopes();
    return;
  }

  if (action === "create") {
    const [name] = rest;
    if (!name) throw new Error("usage: aiscope shared create <name>");
    const scope = await createSharedScope(name);
    console.log(`aiscope: created shared/${scope.name}`);
    return;
  }

  if (action === "set") {
    const [name, key, ...valueParts] = rest;
    if (!name || !key || valueParts.length === 0) throw new Error("usage: aiscope shared set <name> <KEY> <VALUE>");
    validateScopeName(name);
    await createSharedScope(name);
    await setEnvValue(envFilePath("shared", name), key, valueParts.join(" "));
    console.log(`aiscope: set ${key}`);
    console.log(`scope: shared/${name}`);
    return;
  }

  if (action === "unset") {
    const [name, key] = rest;
    if (!name || !key) throw new Error("usage: aiscope shared unset <name> <KEY>");
    validateScopeName(name);
    await unsetEnvValue(envFilePath("shared", name), key);
    console.log(`aiscope: unset ${key}`);
    console.log(`scope: shared/${name}`);
    return;
  }

  await showSharedScope(action);
}

export async function addCommand(args) {
  const [name] = args;
  if (!name) throw new Error("usage: aiscope add <shared-name>");
  const scope = await attachSharedScope(name);
  console.log(`aiscope: attached shared/${name}`);
  console.log(`project: ${scope.type}/${scope.name}`);
}

export async function removeCommand(args) {
  const [name] = args;
  if (!name) throw new Error("usage: aiscope remove <shared-name>");
  const scope = await detachSharedScope(name);
  console.log(`aiscope: removed shared/${name}`);
  console.log(`project: ${scope.type}/${scope.name}`);
}

export async function shareCommand(args) {
  const [sharedName, ...keys] = args;
  if (!sharedName || keys.length === 0) throw new Error("usage: aiscope share <shared-name> <KEY...>");
  validateScopeName(sharedName);

  const scope = await currentScope();
  if (!scope) throw new Error("missing .aiscope.toml. Run aiscope use <name> first.");

  const env = await readEnvFile(scope.envPath);
  await createSharedScope(sharedName);

  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(env, key)) {
      throw new Error(`${key} is not set in ${scope.type}/${scope.name}.`);
    }
    await setEnvValue(envFilePath("shared", sharedName), key, env[key]);
  }

  await attachSharedScope(sharedName);
  console.log(`aiscope: shared ${keys.join(", ")} as shared/${sharedName}`);
  console.log(`project: ${scope.type}/${scope.name}`);
}

async function listSharedScopes() {
  const names = await listSharedNames();
  console.log("Shared scopes:");
  if (names.length === 0) {
    console.log("  (none)");
    return;
  }

  for (const name of names) {
    const env = await readEnvFile(envFilePath("shared", name));
    const keys = Object.keys(env).sort((a, b) => a.localeCompare(b));
    console.log(`  - ${name}${keys.length > 0 ? ` (${keys.join(", ")})` : ""}`);
  }
}

async function showSharedScope(name) {
  validateScopeName(name);
  const env = await readEnvFile(envFilePath("shared", name));
  const keys = Object.keys(env).sort((a, b) => a.localeCompare(b));

  console.log(`shared/${name}`);
  console.log("");
  console.log("Variables:");
  if (keys.length === 0) {
    console.log("  (none)");
    return;
  }

  for (const key of keys) {
    console.log(`  ${key}=${maskValue(env[key])}`);
  }
}

async function listSharedNames() {
  try {
    const entries = await fs.promises.readdir(vaultDir("shared"), { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".env"))
      .map((entry) => path.basename(entry.name, ".env"))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}
