import fs from "node:fs";
import { VALID_ENV_KEY } from "./utils.js";

export async function readEnvFile(filePath) {
  let raw;
  try {
    raw = await fs.promises.readFile(filePath, "utf8");
  } catch {
    throw new Error(`env file not found: ${filePath}`);
  }
  return parseDotenv(raw);
}

export async function setEnvValue(filePath, key, value) {
  validateEnvKey(key);
  const raw = await readRawEnvFile(filePath);
  const next = upsertEnvLine(raw, key, value);
  await fs.promises.writeFile(filePath, next, { mode: 0o600 });
  await chmodEnvFile(filePath);
}

export async function unsetEnvValue(filePath, key) {
  validateEnvKey(key);
  const raw = await readRawEnvFile(filePath);
  const next = removeEnvLine(raw, key);
  await fs.promises.writeFile(filePath, next, { mode: 0o600 });
  await chmodEnvFile(filePath);
}

async function readRawEnvFile(filePath) {
  try {
    return await fs.promises.readFile(filePath, "utf8");
  } catch {
    throw new Error(`env file not found: ${filePath}`);
  }
}

export function parseDotenv(raw) {
  const env = {};
  const lines = raw.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const original = lines[index];
    const line = original.trim();
    if (!line || line.startsWith("#")) continue;

    const equals = line.indexOf("=");
    if (equals === -1) {
      throw new Error(`invalid env file on line ${index + 1}. Expected KEY=value.`);
    }

    const key = line.slice(0, equals).trim();
    if (!VALID_ENV_KEY.test(key)) {
      throw new Error(`invalid env key "${key}" on line ${index + 1}.`);
    }

    const rawValue = line.slice(equals + 1).trim();
    env[key] = parseEnvValue(rawValue);
  }

  return env;
}

function validateEnvKey(key) {
  if (!VALID_ENV_KEY.test(key)) {
    throw new Error(`invalid env key "${key}". Use letters, numbers, and underscore, and do not start with a number.`);
  }
}

function upsertEnvLine(raw, key, value) {
  const lines = raw.split(/\r?\n/);
  const nextLine = `${key}=${formatEnvValue(value)}`;
  let replaced = false;

  const next = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return line;
    const equals = line.indexOf("=");
    if (equals === -1) return line;
    const existingKey = line.slice(0, equals).trim();
    if (existingKey !== key) return line;
    replaced = true;
    return nextLine;
  });

  if (!replaced) {
    if (next.length > 0 && next[next.length - 1] !== "") next.push("");
    next.push(nextLine);
  }

  return ensureTrailingNewline(next.join("\n"));
}

function removeEnvLine(raw, key) {
  const lines = raw.split(/\r?\n/);
  const next = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return true;
    const equals = line.indexOf("=");
    if (equals === -1) return true;
    return line.slice(0, equals).trim() !== key;
  });

  return ensureTrailingNewline(next.join("\n"));
}

function formatEnvValue(value) {
  const text = String(value);
  if (text === "") return '""';
  if (/[\s#"'\\\n\r\t]/.test(text)) {
    return `"${text
      .replaceAll("\\", "\\\\")
      .replaceAll("\n", "\\n")
      .replaceAll("\r", "\\r")
      .replaceAll("\t", "\\t")
      .replaceAll('"', '\\"')}"`;
  }
  return text;
}

function ensureTrailingNewline(value) {
  return value.endsWith("\n") ? value : `${value}\n`;
}

function parseEnvValue(value) {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1)
      .replaceAll("\\n", "\n")
      .replaceAll("\\r", "\r")
      .replaceAll("\\t", "\t")
      .replaceAll('\\"', '"')
      .replaceAll("\\\\", "\\");
  }

  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }

  return stripInlineComment(value).trim();
}

function stripInlineComment(value) {
  let quote = null;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if ((char === '"' || char === "'") && value[index - 1] !== "\\") {
      quote = quote === char ? null : quote || char;
    }
    if (char === "#" && !quote && /\s/.test(value[index - 1] || "")) {
      return value.slice(0, index);
    }
  }
  return value;
}

export async function writeEnvFileIfMissing(filePath) {
  try {
    await fs.promises.writeFile(filePath, "# Add scope-specific environment variables here.\n# OPENAI_API_KEY=sk-...\n", {
      flag: "wx",
      mode: 0o600
    });
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
  }

  await chmodEnvFile(filePath);
}

async function chmodEnvFile(filePath) {
  try {
    await fs.promises.chmod(filePath, 0o600);
  } catch {
    // chmod is best-effort on non-POSIX filesystems.
  }
}

export async function envPermissionStatus(filePath) {
  try {
    const stat = await fs.promises.stat(filePath);
    const unsafe = (stat.mode & 0o077) !== 0;
    return { exists: true, unsafe, mode: stat.mode & 0o777 };
  } catch {
    return { exists: false, unsafe: false, mode: null };
  }
}
