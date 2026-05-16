import { readEnvFile, setEnvValue, unsetEnvValue } from "../core/env.js";
import { currentScope } from "../core/scope.js";
import { readResolvedEnv, sourceForKey } from "../core/resolve.js";
import { maskValue } from "../core/utils.js";

export async function varsCommand() {
  const scope = await requireScope();
  const { env, sources } = await readResolvedEnv(scope);
  const keys = Object.keys(env).sort((a, b) => a.localeCompare(b));

  console.log(`${scope.type}/${scope.name}`);
  if (scope.shared.length > 0) {
    console.log(`shared: ${scope.shared.map((item) => item.name).join(", ")}`);
  }
  console.log("");
  console.log("Variables:");

  if (keys.length === 0) {
    console.log("  (none)");
    return;
  }

  for (const key of keys) {
    const source = sourceForKey(key, sources);
    console.log(`  ${key}=${maskValue(env[key])}  ${source}`);
  }
}

export async function setCommand(args) {
  const { key, value } = parseSetArgs(args);
  const scope = await requireScope();
  await setEnvValue(scope.envPath, key, value);
  console.log(`aiscope: set ${key}`);
  console.log(`scope: ${scope.type}/${scope.name}`);
}

export async function unsetCommand(args) {
  const [key] = args;
  if (!key) throw new Error("usage: aiscope unset <KEY>");
  const scope = await requireScope();
  await unsetEnvValue(scope.envPath, key);
  console.log(`aiscope: unset ${key}`);
  console.log(`scope: ${scope.type}/${scope.name}`);
}

async function requireScope() {
  const scope = await currentScope();
  if (!scope) throw new Error("missing .aiscope.toml. Run aiscope use <name> first.");
  return scope;
}

function parseSetArgs(args) {
  const [first, ...rest] = args;
  if (!first) throw new Error("usage: aiscope set <KEY> <VALUE>");

  const equals = first.indexOf("=");
  if (equals > 0) {
    return {
      key: first.slice(0, equals),
      value: first.slice(equals + 1)
    };
  }

  if (rest.length === 0) throw new Error("usage: aiscope set <KEY> <VALUE>");
  return {
    key: first,
    value: rest.join(" ")
  };
}
