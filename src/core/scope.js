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
