export function helpCommand() {
  console.log(`aiscope
Auto-loading local scopes for AI coding agents.

Usage:
  aiscope init project <name>
  aiscope init skill <name>
  aiscope hook <zsh|bash>
  aiscope status
  aiscope list
  aiscope edit
  aiscope doctor
  aiscope version
  aiscope help

Examples:
  aiscope init project manman-blog
  aiscope edit
  eval "$(aiscope hook zsh)"
  codex

Internal:
  aiscope __activate <cwd>
  aiscope __deactivate`);
}
