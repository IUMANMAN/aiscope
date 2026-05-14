import { shellIdentifier, shellQuote, safeComment } from "./utils.js";

export function exportCommand(key, value) {
  return `export ${shellIdentifier(key)}=${shellQuote(value)}`;
}

export function unsetCommand(key) {
  return `unset ${shellIdentifier(key)}`;
}

export function shellMessage(message) {
  return `printf '%s\\n' ${shellQuote(message)} >&2`;
}

export function activationScript({ config, env, previousKeys = [], previousScope }) {
  const lines = [];
  for (const key of previousKeys) {
    lines.push(unsetCommand(key));
  }

  for (const [key, value] of Object.entries(env)) {
    lines.push(exportCommand(key, value));
  }

  const keys = Object.keys(env);
  lines.push(exportCommand("AISCOPE_ACTIVE", "1"));
  lines.push(exportCommand("AISCOPE_TYPE", config.type));
  lines.push(exportCommand("AISCOPE_NAME", config.name));
  lines.push(exportCommand("AISCOPE_SCOPE", `${config.type}/${config.name}`));
  lines.push(exportCommand("AISCOPE_ENV_FILE", config.envPath));
  lines.push(exportCommand("AISCOPE_CONFIG_FILE", config.configPath));
  lines.push(exportCommand("AISCOPE_LOADED_KEYS", keys.join(" ")));

  const nextScope = `${config.type}/${config.name}`;
  if (previousScope !== nextScope) {
    lines.push(shellMessage(`aiscope: loaded ${safeComment(nextScope)}`));
  }

  return `${lines.join("\n")}\n`;
}

export function deactivationScript({ previousKeys = [], previousScope } = {}) {
  const lines = [];
  for (const key of previousKeys) {
    lines.push(unsetCommand(key));
  }

  for (const key of [
    "AISCOPE_ACTIVE",
    "AISCOPE_TYPE",
    "AISCOPE_NAME",
    "AISCOPE_SCOPE",
    "AISCOPE_ENV_FILE",
    "AISCOPE_CONFIG_FILE",
    "AISCOPE_LOADED_KEYS"
  ]) {
    lines.push(unsetCommand(key));
  }

  if (previousScope) {
    lines.push(shellMessage(`aiscope: unloaded ${safeComment(previousScope)}`));
  }

  return `${lines.join("\n")}\n`;
}

export function hookScript(shell) {
  if (shell === "zsh") return zshHook();
  if (shell === "bash") return bashHook();
  throw new Error(`unsupported shell "${shell}". Use zsh or bash.`);
}

function zshHook() {
  return `
_aiscope_hook() {
  eval "$(aiscope __activate "$PWD")"
}

autoload -Uz add-zsh-hook
add-zsh-hook chpwd _aiscope_hook
_aiscope_hook
`.trimStart();
}

function bashHook() {
  return `
_aiscope_hook() {
  eval "$(aiscope __activate "$PWD")"
}

if [[ -n "\${PROMPT_COMMAND:-}" ]]; then
  case ";\${PROMPT_COMMAND};" in
    *";_aiscope_hook;"*) ;;
    *) PROMPT_COMMAND="_aiscope_hook;\${PROMPT_COMMAND}" ;;
  esac
else
  PROMPT_COMMAND="_aiscope_hook"
fi

_aiscope_hook
`.trimStart();
}
