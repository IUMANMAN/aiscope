import fs from "node:fs";
import path from "node:path";
import { currentScope } from "../core/scope.js";
import { readResolvedEnv, sourceForKey } from "../core/resolve.js";
import { displayPath } from "../core/paths.js";
import { maskValue, pathExists } from "../core/utils.js";

export async function dashboardCommand() {
  const scope = await currentScope();
  const activeScope = process.env.AISCOPE_SCOPE || "";

  console.log("aiscope dashboard");
  console.log("");

  if (!scope) {
    console.log("No project scope in this folder.");
    console.log("");
    console.log("Start here:");
    console.log("  aiscope use <project-name>");
    console.log("  aiscope set OPENAI_API_KEY sk-...");
    return;
  }

  const { env, sources } = await readResolvedEnv(scope);
  const projectSource = sources.find((source) => source.type === scope.type && source.name === scope.name);
  const sharedSources = sources.filter((source) => source.type === "shared");
  const keys = Object.keys(env).sort((a, b) => a.localeCompare(b));

  section("Current project");
  line("Scope", `${scope.type}/${scope.name}`);
  line("Hook", activeScope === `${scope.type}/${scope.name}` ? "active" : "not active in this shell");
  line("Config", displayPath(scope.configPath));
  line("Env file", displayPath(scope.envPath));
  line(".env.local", await linkStatus(".env.local", scope.envPath));

  section("Attached shared scopes");
  if (sharedSources.length === 0) {
    console.log("  (none)");
  } else {
    for (const source of sharedSources) {
      console.log(`  shared/${source.name}  ${Object.keys(source.env).length} key(s)`);
    }
  }

  section("Project variables");
  printSourceVariables(projectSource);

  section("Shared variables");
  if (sharedSources.length === 0) {
    console.log("  (none)");
  } else {
    for (const source of sharedSources) {
      printSourceVariables(source);
    }
  }

  section("Resolved environment");
  if (keys.length === 0) {
    console.log("  (none)");
  } else {
    for (const key of keys) {
      console.log(`  ${key}=${maskValue(env[key])}  ${sourceForKey(key, sources)}`);
    }
  }

  const conflicts = conflictKeys(sources);
  if (conflicts.length > 0) {
    section("Overrides");
    for (const item of conflicts) {
      console.log(`  ${item.key}  ${item.winner} overrides ${item.overridden.join(", ")}`);
    }
  }

  section("Next actions");
  console.log("  aiscope set KEY value");
  console.log("  aiscope vars");
  console.log("  aiscope shared");
  console.log("  aiscope link");
}

function section(title) {
  console.log("");
  console.log(title);
}

function line(label, value) {
  console.log(`  ${label}: ${value}`);
}

function printSourceVariables(source) {
  if (!source) {
    console.log("  (none)");
    return;
  }

  const keys = Object.keys(source.env).sort((a, b) => a.localeCompare(b));
  if (keys.length === 0) {
    console.log(`  ${source.type}/${source.name}: (none)`);
    return;
  }

  console.log(`  ${source.type}/${source.name}`);
  for (const key of keys) {
    console.log(`    ${key}=${maskValue(source.env[key])}`);
  }
}

async function linkStatus(fileName, targetPath) {
  const linkPath = path.resolve(process.cwd(), fileName);
  if (!(await pathExists(linkPath))) return "not linked";

  const stat = await fs.promises.lstat(linkPath);
  if (!stat.isSymbolicLink()) return "exists, not a symlink";

  const existingTarget = await fs.promises.readlink(linkPath);
  const resolved = path.resolve(path.dirname(linkPath), existingTarget);
  if (resolved === targetPath) return `linked -> ${displayPath(targetPath)}`;
  return `linked elsewhere -> ${displayPath(resolved)}`;
}

function conflictKeys(sources) {
  const seen = new Map();
  for (const source of sources) {
    for (const key of Object.keys(source.env)) {
      const label = `${source.type}/${source.name}`;
      const existing = seen.get(key) || [];
      existing.push(label);
      seen.set(key, existing);
    }
  }

  return [...seen.entries()]
    .filter(([, labels]) => labels.length > 1)
    .map(([key, labels]) => ({
      key,
      winner: labels[labels.length - 1],
      overridden: labels.slice(0, -1)
    }));
}
