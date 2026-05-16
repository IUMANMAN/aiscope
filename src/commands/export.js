import { currentScope } from "../core/scope.js";
import { readEnvFile } from "../core/env.js";
import { exportCommand as shellExportCommand } from "../core/shell.js";

export async function exportCommandForScope() {
  const scope = await currentScope();
  if (!scope) {
    throw new Error("missing .aiscope.toml. Run aiscope init project <name> or aiscope init skill <name> first.");
  }

  const env = await readEnvFile(scope.envPath);
  for (const [key, value] of Object.entries(env)) {
    console.log(shellExportCommand(key, value));
  }
}
