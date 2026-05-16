import fs from "node:fs";
import path from "node:path";
import { currentScope } from "../core/scope.js";
import { readResolvedEnv, sourceForKey } from "../core/resolve.js";
import { displayPath, envFilePath, vaultDir } from "../core/paths.js";
import { readEnvFile } from "../core/env.js";
import { maskValue, pathExists } from "../core/utils.js";

export async function dashboardCommand() {
  const scope = await currentScope();
  const activeScope = process.env.AISCOPE_SCOPE || "";

  console.log("aiscope dashboard");
  console.log("");

  if (!scope) {
    await printGlobalDashboard();
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

async function printGlobalDashboard() {
  const projects = await readNamedEnvScopes("project");
  const skills = await readNamedEnvScopes("skill");
  const shared = await readNamedEnvScopes("shared");
  const total = projects.length + skills.length + shared.length;

  section("Global vault");
  line("Location", displayPath(vaultDir("project")).replace(/\/vault\/projects$/, ""));
  line("Projects", String(projects.length));
  line("Skills", String(skills.length));
  line("Shared", String(shared.length));

  section("Projects");
  printScopeList(projects);

  section("Shared");
  printScopeList(shared);

  section("Skills");
  printScopeList(skills);

  if (total === 0) {
    section("Start here");
    console.log("  aiscope use <project-name>");
    console.log("  aiscope set OPENAI_API_KEY sk-...");
    return;
  }

  section("Next actions");
  console.log("  cd <project>");
  console.log("  aiscope use <project-name>");
  console.log("  aiscope vars");
  console.log("  aiscope shared");
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

function printScopeList(scopes) {
  if (scopes.length === 0) {
    console.log("  (none)");
    return;
  }

  for (const scope of scopes) {
    const keys = Object.keys(scope.env).sort((a, b) => a.localeCompare(b));
    console.log(`  ${scope.type}/${scope.name}`);
    if (keys.length === 0) {
      console.log("    (none)");
      continue;
    }
    for (const key of keys) {
      console.log(`    ${key}=${maskValue(scope.env[key])}`);
    }
  }
}

async function readNamedEnvScopes(type) {
  let names;
  try {
    const entries = await fs.promises.readdir(vaultDir(type), { withFileTypes: true });
    names = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".env"))
      .map((entry) => path.basename(entry.name, ".env"))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }

  const scopes = [];
  for (const name of names) {
    scopes.push({
      type,
      name,
      env: await readEnvFile(envFilePath(type, name))
    });
  }
  return scopes;
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
