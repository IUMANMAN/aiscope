import { findConfig, readConfig } from "../core/config.js";
import { readResolvedEnv } from "../core/resolve.js";
import { activationScript, deactivationScript, hookScript } from "../core/shell.js";

export function hookCommand(args) {
  const [shell] = args;
  if (!shell) throw new Error("usage: aiscope hook <zsh|bash>");
  process.stdout.write(hookScript(shell));
}

export async function activateCommand(args) {
  const [cwd = process.cwd()] = args;
  const previousKeys = parseLoadedKeys(process.env.AISCOPE_LOADED_KEYS);
  const previousScope = process.env.AISCOPE_SCOPE || "";
  const configPath = await findConfig(cwd);

  if (!configPath) {
    process.stdout.write(deactivationScript({ previousKeys, previousScope }));
    return;
  }

  const config = await readConfig(configPath);
  const nextScope = `${config.type}/${config.name}`;
  const currentConfig = process.env.AISCOPE_CONFIG_FILE || "";

  if (previousScope === nextScope && currentConfig === config.configPath) {
    process.stdout.write("");
    return;
  }

  const { env } = await readResolvedEnv(config);
  process.stdout.write(activationScript({ config, env, previousKeys, previousScope }));
}

export function deactivateCommand() {
  process.stdout.write(deactivationScript({
    previousKeys: parseLoadedKeys(process.env.AISCOPE_LOADED_KEYS),
    previousScope: process.env.AISCOPE_SCOPE || ""
  }));
}

function parseLoadedKeys(value = "") {
  return value.split(/\s+/).filter(Boolean);
}
