import { readEnvFile } from "./env.js";

export async function readResolvedEnv(scope) {
  const sources = [];
  const merged = {};

  for (const shared of scope.shared || []) {
    const env = await readEnvFile(shared.envPath);
    sources.push({ type: "shared", name: shared.name, env });
    Object.assign(merged, env);
  }

  const localEnv = await readEnvFile(scope.envPath);
  sources.push({ type: scope.type, name: scope.name, env: localEnv });
  Object.assign(merged, localEnv);

  return { env: merged, sources };
}

export function sourceForKey(key, sources) {
  for (let index = sources.length - 1; index >= 0; index -= 1) {
    if (Object.prototype.hasOwnProperty.call(sources[index].env, key)) {
      return `${sources[index].type}/${sources[index].name}`;
    }
  }
  return "";
}
