import { useProjectScope } from "../core/scope.js";
import { displayPath } from "../core/paths.js";

export async function useCommand(args) {
  const [name] = args;
  if (!name) throw new Error("usage: aiscope use <name>");

  const scope = await useProjectScope(name);
  const action = scope.reused ? "using" : "created";

  console.log(`aiscope: ${action} project/${scope.name}`);
  console.log(`config: ${displayPath(scope.configPath)}`);
  console.log(`env: ${displayPath(scope.envPath)}`);
  console.log("");
  console.log("Manage variables:");
  console.log("  aiscope set OPENAI_API_KEY sk-...");
  console.log("  aiscope vars");
  console.log("");
  console.log("Use it:");
  console.log('  eval "$(aiscope hook zsh)"');
  console.log("  codex");
}
