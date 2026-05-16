export function helpCommand() {
  console.log(`aiscope
Auto-loading local scopes for AI coding agents.

Usage:
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
  aiscope init project demo-app
  aiscope edit
  aiscope link
  codex

Notes:
  aiscope automatically exports env variables when the shell hook is active.
  aiscope link creates .env.local for frameworks that read env files from disk.

Internal:
  aiscope __activate <cwd>
  aiscope __deactivate`);
}
