import os from "node:os";
import path from "node:path";

export function homeDir() {
  return os.homedir();
}

export function aiscopeHome() {
  return path.join(homeDir(), ".aiscope");
}

export function expandHome(value) {
  if (!value) return value;
  if (value === "~") return homeDir();
  if (value.startsWith("~/")) return path.join(homeDir(), value.slice(2));
  return value;
}

export function displayPath(value) {
  const home = homeDir();
  if (value === home) return "~";
  if (value.startsWith(`${home}${path.sep}`)) return `~/${value.slice(home.length + 1)}`;
  return value;
}

export function vaultDir(type) {
  return path.join(aiscopeHome(), "vault", pluralType(type));
}

export function scopesDir(type) {
  return path.join(aiscopeHome(), "scopes", pluralType(type));
}

export function logsDir() {
  return path.join(aiscopeHome(), "logs");
}

export function envFilePath(type, name) {
  return path.join(vaultDir(type), `${name}.env`);
}

export function scopeDocPath(type, name) {
  return path.join(scopesDir(type), `${name}.md`);
}

export function pluralType(type) {
  if (type === "project") return "projects";
  if (type === "skill") return "skills";
  if (type === "shared") return "shared";
  throw new Error(`unsupported scope type "${type}"`);
}

export function singularType(plural) {
  if (plural === "projects") return "project";
  if (plural === "skills") return "skill";
  if (plural === "shared") return "shared";
  throw new Error(`unsupported scope directory "${plural}"`);
}
