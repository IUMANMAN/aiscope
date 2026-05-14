import fs from "node:fs";
import path from "node:path";
import { expandHome } from "./paths.js";
import { validateScopeName, validateScopeType } from "./utils.js";

export const CONFIG_FILE = ".aiscope.toml";

export async function findConfig(startDir = process.cwd()) {
  let current = path.resolve(startDir);

  while (true) {
    const candidate = path.join(current, CONFIG_FILE);
    try {
      await fs.promises.access(candidate);
      return candidate;
    } catch {
      const parent = path.dirname(current);
      if (parent === current) return null;
      current = parent;
    }
  }
}

export async function readConfig(configPath) {
  let raw;
  try {
    raw = await fs.promises.readFile(configPath, "utf8");
  } catch {
    throw new Error(`missing ${CONFIG_FILE}.`);
  }

  const parsed = parseSimpleToml(raw);
  validateConfig(parsed);
  return {
    ...parsed,
    envPath: expandHome(parsed.env),
    configPath
  };
}

export function parseSimpleToml(raw) {
  const result = {};
  const lines = raw.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = stripTomlComment(lines[index]).trim();
    if (!line) continue;

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*=\s*(.+)$/);
    if (!match) {
      throw new Error(`invalid TOML on line ${index + 1}. Expected key = "value".`);
    }

    const [, key, rawValue] = match;
    result[key] = parseTomlString(rawValue.trim(), index + 1);
  }

  return result;
}

function stripTomlComment(line) {
  let quote = null;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if ((char === '"' || char === "'") && line[index - 1] !== "\\") {
      quote = quote === char ? null : quote || char;
    }
    if (char === "#" && !quote) return line.slice(0, index);
  }
  return line;
}

function parseTomlString(value, lineNumber) {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replaceAll('\\"', '"').replaceAll("\\\\", "\\");
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }
  throw new Error(`invalid TOML on line ${lineNumber}. Values must be quoted strings.`);
}

function validateConfig(config) {
  for (const key of ["type", "name", "env"]) {
    if (!config[key]) throw new Error(`invalid .aiscope.toml. Missing "${key}".`);
  }
  validateScopeType(config.type);
  validateScopeName(config.name);
}

export function configText(type, name, envPath) {
  return `type = "${type}"\nname = "${name}"\nenv = "${envPath}"\n`;
}
