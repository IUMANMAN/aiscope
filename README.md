<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/IUMANMAN/aiscope/main/docs/aiscope-mark-dark.svg">
    <img alt="aiscope" src="https://raw.githubusercontent.com/IUMANMAN/aiscope/main/docs/aiscope-mark.svg" width="108">
  </picture>
</p>

<h1 align="center">aiscope</h1>

<p align="center">
  <strong>Auto-loading local scopes for AI coding agents.</strong>
</p>

<p align="center">
  <a href="https://github.com/IUMANMAN/aiscope"><img alt="install" src="https://img.shields.io/badge/install-from%20GitHub-4ee1a0"></a>
  <a href="https://github.com/IUMANMAN/aiscope/blob/main/LICENSE"><img alt="license" src="https://img.shields.io/github/license/IUMANMAN/aiscope"></a>
  <a href="https://github.com/IUMANMAN/aiscope"><img alt="node" src="https://img.shields.io/badge/node-%3E%3D18-7cc7ff"></a>
  <a href="https://iumanman.github.io/aiscope/"><img alt="pages" src="https://img.shields.io/badge/docs-GitHub%20Pages-4ee1a0"></a>
</p>

<p align="center">
  <a href="./README.zh-CN.md">中文</a>
  <span> · </span>
  <a href="https://iumanman.github.io/aiscope/">Website</a>
  <span> · </span>
  <a href="https://github.com/IUMANMAN/aiscope/issues">Issues</a>
</p>

<br>

```bash
cd ~/projects/demo-app
codex
```

No wrapper command. No global secrets. No manual env switching.

`aiscope` is a tiny local scope manager for AI coding work. It automatically loads the right environment variables when you enter a project or skill folder, then unloads them when you leave.

Think `direnv` for AI agents, but simpler, safer by default, and built around project and skill scopes.

## The Problem

AI coding agents need API keys, model provider credentials, database URLs, Cloudflare/Vercel tokens, and workflow-specific settings.

Most developers end up with one of these:

```bash
dotenvx run -- codex
source .env && claude
OPENAI_API_KEY=... codex
```

That gets old quickly. It also makes it too easy to leak one project's environment into another project.

## The aiscope Way

```bash
cd ~/projects/demo-app
aiscope: loaded project/demo-app
codex

cd ..
aiscope: unloaded project/demo-app
```

The folder controls the scope. Any CLI launched inside the folder receives the right environment.

## Highlights

| Capability | What it gives you |
| --- | --- |
| Folder-aware scopes | Enter a scoped folder and the right env loads automatically. |
| Automatic unload | Leave the folder and previous scope variables are removed. |
| Project and skill scopes | Use `project/demo-app` and `skill/frontend-design` today. |
| Local vault | Keep env files in `~/.aiscope/vault` instead of every repo. |
| Masked status | See which keys are loaded without printing secret values. |
| Any CLI | Works with Codex, Claude Code, npm, Python, Node, Wrangler, Vercel, and more. |

## Install

Install directly from GitHub. This does not require an npm registry account:

```bash
npm install -g github:IUMANMAN/aiscope
```

If the package is published to the npm registry later, this shorter command will also work:

```bash
npm install -g aiscope
```

Use from source today:

```bash
git clone https://github.com/IUMANMAN/aiscope.git
cd aiscope
npm link
```

## Setup

For zsh:

```bash
eval "$(aiscope hook zsh)"
```

Permanent zsh setup:

```bash
echo 'eval "$(aiscope hook zsh)"' >> ~/.zshrc
source ~/.zshrc
```

For bash:

```bash
eval "$(aiscope hook bash)"
```

## Quick Start

```bash
mkdir my-app
cd my-app
aiscope init project my-app
aiscope edit
codex
```

`aiscope edit` opens the scope env file in `$EDITOR`, or `nano` when `$EDITOR` is not set.

## Skill Scopes

Skill scopes are useful for reusable AI workflows:

```bash
mkdir frontend-design
cd frontend-design
aiscope init skill frontend-design
aiscope edit
claude
```

## Commands

| Command | Description |
| --- | --- |
| `aiscope init project <name>` | Create a project scope. |
| `aiscope init skill <name>` | Create a skill scope. |
| `aiscope hook zsh` | Print the zsh shell hook. |
| `aiscope hook bash` | Print the bash shell hook. |
| `aiscope status` | Show the active scope and masked keys. |
| `aiscope list` | List known scopes. |
| `aiscope edit` | Edit the current scope env file. |
| `aiscope doctor` | Check local setup. |
| `aiscope version` | Print package version. |
| `aiscope help` | Print help. |

## Config

Each scoped folder contains `.aiscope.toml`:

```toml
type = "project"
name = "demo-app"
env = "~/.aiscope/vault/projects/demo-app.env"
```

Skill scopes use:

```toml
type = "skill"
name = "writing-kit"
env = "~/.aiscope/vault/skills/writing-kit.env"
```

Scope names support letters, numbers, dot, dash, and underscore.

## Vault Layout

```text
~/.aiscope/
  vault/
    projects/
      demo-app.env
    skills/
      writing-kit.env
  scopes/
    projects/
      demo-app.md
    skills/
      writing-kit.md
  logs/
```

## Env Files

Env files are plain dotenv files:

```dotenv
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
DATABASE_URL="postgresql://localhost/my_app"
```

Supported:

- comments starting with `#`
- blank lines
- `KEY=value`
- quoted values with spaces

`aiscope` parses env files as data. It does not execute or source them.

## Security Model

`aiscope` is intentionally local-first:

- Secrets live locally in `~/.aiscope/vault`
- New env files are created with `0600` permissions when possible
- Normal CLI output masks secret values
- The hook unloads previous scope variables before loading a new scope
- Leaving a scoped folder clears `AISCOPE_*` metadata and loaded keys
- `.env` and `*.env` are ignored by default

Any process started inside an active scope can read that scope's environment variables. That is how shell environments work, and it is why scopes should stay local and specific.

## Status Example

```bash
aiscope status
```

```text
Active scope: project/demo-app
Config: /Users/user/projects/demo-app/.aiscope.toml
Env file: /Users/user/.aiscope/vault/projects/demo-app.env

Loaded keys:
  OPENAI_API_KEY=***
  ANTHROPIC_API_KEY=***
  DATABASE_URL=***
```

## Comparison

| Tool | Main idea | AI scope support |
| --- | --- | --- |
| direnv | Folder env loading | Generic |
| dotenvx | Dotenv loading and encryption | Generic |
| mise | Dev tools and env | Generic |
| aiscope | AI project and skill scopes | Built in |

## Roadmap

- encrypted local vault
- scope permissions
- AI context files
- agent and workflow scopes
- 1Password integration
- Bitwarden integration
- team-shared encrypted scopes
- VS Code extension
- Homebrew install
- Windows support

## Development

```bash
npm test
npm run lint
npm pack --dry-run
```

## License

MIT
