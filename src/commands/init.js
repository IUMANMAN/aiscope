import { createScope } from "../core/scope.js";
import { displayPath } from "../core/paths.js";

export async function initCommand(args) {
  const [type, name] = args;
  if (!type || !name) {
    throw new Error("usage: aiscope init <project|skill> <name>");
  }

  const scope = await createScope(type, name);
  console.log(`aiscope: created ${scope.type}/${scope.name}`);
  console.log(`config: ${displayPath(scope.configPath)}`);
  console.log(`env: ${displayPath(scope.envPath)}`);
  console.log("");
  console.log("Next:");
  console.log("  aiscope edit");
  console.log('  eval "$(aiscope hook zsh)"');
  console.log("  codex");
}
