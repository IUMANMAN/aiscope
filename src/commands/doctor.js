import { aiscopeHome, displayPath } from "../core/paths.js";
import { findConfig, readConfig } from "../core/config.js";
import { envPermissionStatus } from "../core/env.js";
import { pathExists } from "../core/utils.js";

export async function doctorCommand() {
  console.log("aiscope doctor");
  console.log("");

  check("Node.js", process.version, Number(process.versions.node.split(".")[0]) >= 18);
  check("Current shell", process.env.SHELL || "unknown", Boolean(process.env.SHELL));

  const homeExists = await pathExists(aiscopeHome());
  check("~/.aiscope", homeExists ? "found" : "missing", homeExists);

  const configPath = await findConfig(process.cwd());
  check(".aiscope.toml", configPath ? displayPath(configPath) : "not found", Boolean(configPath), "Run aiscope init project <name>.");

  let config = null;
  if (configPath) {
    try {
      config = await readConfig(configPath);
      check("Config validity", `${config.type}/${config.name}`, true);
    } catch (error) {
      check("Config validity", error.message, false);
    }
  }

  if (config) {
    const envExists = await pathExists(config.envPath);
    check("Env file", envExists ? displayPath(config.envPath) : "not found", envExists);

    const permissions = await envPermissionStatus(config.envPath);
    if (permissions.exists) {
      const mode = permissions.mode.toString(8).padStart(3, "0");
      check("Env permissions", mode, !permissions.unsafe, "Recommended: chmod 600 <env-file>.");
    }
  }

  check("Shell hook", process.env.AISCOPE_ACTIVE === "1" ? "active" : "not active", process.env.AISCOPE_ACTIVE === "1", 'Add eval "$(aiscope hook zsh)" to your shell config.');
}

function check(label, value, ok, hint = "") {
  const marker = ok ? "ok" : "warn";
  console.log(`${marker.padEnd(4)} ${label}: ${value}`);
  if (!ok && hint) console.log(`     ${hint}`);
}
