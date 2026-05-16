import fs from "node:fs";

export const VALID_SCOPE_NAME = /^[a-zA-Z0-9._-]+$/;
export const VALID_ENV_KEY = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function validateScopeType(type) {
  if (type !== "project" && type !== "skill" && type !== "shared") {
    throw new Error('scope type must be "project", "skill", or "shared".');
  }
}

export function validateScopeName(name) {
  if (!name || !VALID_SCOPE_NAME.test(name)) {
    throw new Error("invalid scope name. Use only letters, numbers, dot, dash, and underscore.");
  }
}

export async function pathExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function maskValue(value) {
  if (value === undefined || value === "") return "***";
  return "***";
}

export function unique(values) {
  return [...new Set(values)];
}

export function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

export function shellIdentifier(name) {
  if (!VALID_ENV_KEY.test(name)) {
    throw new Error(`invalid environment variable name "${name}"`);
  }
  return name;
}

export function safeComment(value) {
  return String(value).replaceAll("\n", " ").replaceAll("\r", " ");
}
