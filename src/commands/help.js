export function helpCommand() {
  console.log(`aiscope
Auto-loading local scopes for AI coding agents.

Usage:
  aiscope use <name>
  aiscope set <KEY> <VALUE>
  aiscope unset <KEY>
  aiscope vars
  aiscope dashboard
  aiscope dashboard --plain
  aiscope shared
  aiscope shared create <name>
  aiscope share <shared-name> <KEY...>
  aiscope add <shared-name>
  aiscope remove <shared-name>
  aiscope init project <name>
  aiscope init skill <name>
  aiscope hook <zsh|bash>
  aiscope export
  aiscope status
  aiscope list
  aiscope edit
  aiscope link [file]
  aiscope doctor
  aiscope version
  aiscope help

Examples:
  npm install -g aiscope
  eval "$(aiscope hook zsh)"
  aiscope use demo-app
  aiscope set OPENAI_API_KEY sk-...
  aiscope share openai OPENAI_API_KEY
  aiscope dashboard
  aiscope shared
  aiscope link
  codex

Notes:
  aiscope use <name> creates or attaches this folder to one central env scope.
  aiscope dashboard opens an interactive local dashboard in a terminal.
  aiscope dashboard --plain prints the non-interactive report.
  aiscope share copies selected project variables into a shared scope.
  aiscope automatically exports env variables when the shell hook is active.
  aiscope link creates .env.local for frameworks that read env files from disk.

Internal:
  aiscope __activate <cwd>
  aiscope __deactivate`);
}
