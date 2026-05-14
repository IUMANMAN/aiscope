import { currentScope } from "../core/scope.js";
import { readEnvFile } from "../core/env.js";
import { displayPath } from "../core/paths.js";
import { maskValue } from "../core/utils.js";

export async function statusCommand() {
  const active = process.env.AISCOPE_ACTIVE === "1";

  if (active) {
    console.log(`Active scope: ${process.env.AISCOPE_SCOPE}`);
    console.log(`Config: ${process.env.AISCOPE_CONFIG_FILE}`);
    console.log(`Env file: ${process.env.AISCOPE_ENV_FILE}`);
    printLoadedKeys(process.env.AISCOPE_LOADED_KEYS, process.env);
    return;
  }

  const localScope = await currentScope();
  if (!localScope) {
    console.log("No active aiscope scope.");
    return;
  }

  console.log("No active aiscope scope.");
  console.log("");
  console.log(`Found config: ${displayPath(localScope.configPath)}`);
  console.log("The shell hook does not seem active in this shell.");
  console.log("");
  console.log("Add this to your shell config:");
  console.log('  eval "$(aiscope hook zsh)"');
  console.log("");
  console.log("Then restart your shell or source the config file.");
}

function printLoadedKeys(keysValue = "", env = process.env) {
  const keys = keysValue.split(/\s+/).filter(Boolean);
  console.log("");
  console.log("Loaded keys:");
  if (keys.length === 0) {
    console.log("  (none)");
    return;
  }
  for (const key of keys) {
    console.log(`  ${key}=${maskValue(env[key])}`);
  }
}
