import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { spawn } from "node:child_process";
import { attachSharedScope, createScope, createSharedScope, currentScope, detachSharedScope } from "../core/scope.js";
import { readResolvedEnv, sourceForKey } from "../core/resolve.js";
import { displayPath, envFilePath, vaultDir } from "../core/paths.js";
import { readEnvFile } from "../core/env.js";
import { maskValue, pathExists, validateScopeName } from "../core/utils.js";

const TABS = ["Overview", "Projects", "Shared", "Skills"];

export async function dashboardCommand(args = []) {
  const interactive = !args.includes("--plain") && process.stdin.isTTY && process.stdout.isTTY && !process.env.CI;
  if (interactive) {
    await runInteractiveDashboard();
    return;
  }

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

async function runInteractiveDashboard() {
  const state = {
    tabIndex: 0,
    selected: [0, 0, 0, 0],
    message: "",
    data: await loadDashboardData()
  };

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  const cleanup = () => {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdout.write("\x1b[?25h");
  };

  const rerender = () => renderInteractiveDashboard(state);
  rerender();

  return new Promise((resolve) => {
    const finish = () => {
      cleanup();
      clearScreen();
      resolve();
    };

    process.stdin.on("keypress", async (text, key) => {
      try {
        if (state.busy) return;

        if (key.ctrl && key.name === "c") {
          finish();
          return;
        }

        if (key.name === "q" || key.name === "escape") {
          finish();
          return;
        }

        if (key.name === "right" || key.name === "tab") {
          state.tabIndex = (state.tabIndex + 1) % TABS.length;
        } else if (key.name === "left") {
          state.tabIndex = (state.tabIndex + TABS.length - 1) % TABS.length;
        } else if (key.name === "down") {
          moveSelection(state, 1);
        } else if (key.name === "up") {
          moveSelection(state, -1);
        } else if (key.name === "space") {
          await toggleSelectedShared(state);
        } else if (text === "e") {
          await editSelectedScope(state);
        } else if (text === "c") {
          await createInSelectedTab(state);
        } else if (text === "r") {
          state.data = await loadDashboardData();
          state.message = "Refreshed.";
        } else if (text === "p") {
          state.tabIndex = 1;
        } else if (text === "s") {
          state.tabIndex = 2;
        }

        rerender();
      } catch (error) {
        state.message = error.message;
        rerender();
      }
    });
  });
}

async function loadDashboardData() {
  const scope = await currentScope();
  const projects = await readNamedEnvScopes("project");
  const skills = await readNamedEnvScopes("skill");
  const shared = await readNamedEnvScopes("shared");
  const attached = new Set(scope?.shared?.map((item) => item.name) || []);
  let resolved = null;
  let sources = [];

  if (scope) {
    const result = await readResolvedEnv(scope);
    resolved = result.env;
    sources = result.sources;
  }

  return {
    scope,
    projects,
    skills,
    shared,
    attached,
    resolved,
    sources,
    activeScope: process.env.AISCOPE_SCOPE || ""
  };
}

function renderInteractiveDashboard(state) {
  const { data } = state;
  clearScreen();
  process.stdout.write("\x1b[?25l");
  console.log("aiscope dash");
  console.log("");
  console.log(renderTabs(state.tabIndex));
  console.log("");

  if (state.tabIndex === 0) renderOverview(data);
  if (state.tabIndex === 1) renderScopeTable("Projects", data.projects, state.selected[1]);
  if (state.tabIndex === 2) renderSharedTable(data, state.selected[2]);
  if (state.tabIndex === 3) renderScopeTable("Skills", data.skills, state.selected[3]);

  console.log("");
  console.log("Keys: left/right tabs  up/down move  space attach/remove shared  e edit  c create  r refresh  q quit");
  if (state.message) console.log(`Status: ${state.message}`);
}

function renderTabs(activeIndex) {
  return TABS.map((tab, index) => (index === activeIndex ? `[ ${tab} ]` : `  ${tab}  `)).join(" ");
}

function renderOverview(data) {
  const active = data.activeScope || "not active in this shell";
  const current = data.scope ? `${data.scope.type}/${data.scope.name}` : "none in this folder";
  line("Current folder", current);
  line("Hook", active);
  line("Vault", displayPath(vaultDir("project")).replace(/\/vault\/projects$/, ""));
  line("Projects", String(data.projects.length));
  line("Shared", String(data.shared.length));
  line("Skills", String(data.skills.length));

  console.log("");
  console.log("Resolved variables");
  if (!data.resolved) {
    console.log("  Open a project folder or run `aiscope use <project-name>`.");
    return;
  }

  const keys = Object.keys(data.resolved).sort((a, b) => a.localeCompare(b));
  if (keys.length === 0) {
    console.log("  (none)");
    return;
  }

  for (const key of keys) {
    console.log(`  ${key}=${maskValue(data.resolved[key])}  ${sourceForKey(key, data.sources)}`);
  }
}

function renderScopeTable(title, scopes, selectedIndex) {
  console.log(title);
  if (scopes.length === 0) {
    console.log("  (none)");
    return;
  }

  for (let index = 0; index < scopes.length; index += 1) {
    const scope = scopes[index];
    const selected = index === selectedIndex ? ">" : " ";
    const keyCount = Object.keys(scope.env).length;
    console.log(`${selected} ${scope.type}/${scope.name}  ${keyCount} key(s)`);
    if (index === selectedIndex) printMaskedKeys(scope.env);
  }
}

function renderSharedTable(data, selectedIndex) {
  console.log("Shared scopes");
  if (data.shared.length === 0) {
    console.log("  (none)");
    return;
  }

  for (let index = 0; index < data.shared.length; index += 1) {
    const scope = data.shared[index];
    const selected = index === selectedIndex ? ">" : " ";
    const checked = data.attached.has(scope.name) ? "[x]" : "[ ]";
    const keyCount = Object.keys(scope.env).length;
    console.log(`${selected} ${checked} shared/${scope.name}  ${keyCount} key(s)`);
    if (index === selectedIndex) printMaskedKeys(scope.env);
  }

  if (!data.scope) {
    console.log("");
    console.log("Open a project folder to attach or remove shared scopes.");
  }
}

function printMaskedKeys(env) {
  const keys = Object.keys(env).sort((a, b) => a.localeCompare(b));
  if (keys.length === 0) {
    console.log("    (none)");
    return;
  }
  for (const key of keys) console.log(`    ${key}=${maskValue(env[key])}`);
}

function moveSelection(state, delta) {
  const rows = rowCountForTab(state);
  if (rows === 0) return;
  const current = state.selected[state.tabIndex];
  state.selected[state.tabIndex] = (current + delta + rows) % rows;
}

function rowCountForTab(state) {
  if (state.tabIndex === 1) return state.data.projects.length;
  if (state.tabIndex === 2) return state.data.shared.length;
  if (state.tabIndex === 3) return state.data.skills.length;
  return 0;
}

async function toggleSelectedShared(state) {
  if (state.tabIndex !== 2) {
    state.message = "Space toggles shared scopes in the Shared tab.";
    return;
  }
  if (!state.data.scope) {
    state.message = "Open a project folder before attaching shared scopes.";
    return;
  }
  const selected = state.data.shared[state.selected[2]];
  if (!selected) return;

  if (state.data.attached.has(selected.name)) {
    await detachSharedScope(selected.name);
    state.message = `Removed shared/${selected.name}.`;
  } else {
    await attachSharedScope(selected.name);
    state.message = `Attached shared/${selected.name}.`;
  }
  state.data = await loadDashboardData();
}

async function editSelectedScope(state) {
  const selected = selectedScope(state);
  if (!selected) {
    state.message = "Select a project, shared scope, or skill to edit.";
    return;
  }
  state.busy = true;
  try {
    await openEditor(envFilePath(selected.type, selected.name));
    state.data = await loadDashboardData();
    state.message = `Edited ${selected.type}/${selected.name}.`;
  } finally {
    state.busy = false;
  }
}

function selectedScope(state) {
  if (state.tabIndex === 1) return state.data.projects[state.selected[1]] || null;
  if (state.tabIndex === 2) return state.data.shared[state.selected[2]] || null;
  if (state.tabIndex === 3) return state.data.skills[state.selected[3]] || null;
  return null;
}

async function createInSelectedTab(state) {
  const type = state.tabIndex === 2 ? "shared" : state.tabIndex === 3 ? "skill" : "project";
  state.busy = true;
  try {
    const name = await promptLine(`Create ${type} name: `);
    validateScopeName(name);

    if (type === "shared") {
      await createSharedScope(name);
    } else {
      await createScope(type, name);
    }

    state.data = await loadDashboardData();
    state.message = `Created ${type}/${name}.`;
  } finally {
    state.busy = false;
  }
}

async function openEditor(filePath) {
  process.stdin.setRawMode(false);
  process.stdout.write("\x1b[?25h");
  const editor = process.env.EDITOR || "nano";
  await new Promise((resolve, reject) => {
    const child = spawn(editor, [filePath], { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${editor} exited with code ${code}`));
    });
  });
  process.stdin.setRawMode(true);
  process.stdout.write("\x1b[?25l");
}

async function promptLine(label) {
  process.stdin.setRawMode(false);
  process.stdout.write("\x1b[?25h");
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(label, (answer) => {
      rl.close();
      process.stdin.setRawMode(true);
      process.stdout.write("\x1b[?25l");
      resolve(answer.trim());
    });
  });
}

function clearScreen() {
  process.stdout.write("\x1b[2J\x1b[H");
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
