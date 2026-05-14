# aiscope

**Auto-loading local scopes for AI coding agents.**

[中文 README](./README.zh-CN.md) · [GitHub Pages](https://iumanman.github.io/aiscope/) · [Issues](https://github.com/IUMANMAN/aiscope/issues)

```bash
cd ~/projects/demo-app
codex
```

No wrapper command. No global secrets. No manual env switching.

`aiscope` is a tiny local scope manager for AI coding work. It automatically loads the right environment variables when you enter a project or skill folder, then unloads them when you leave.

Think `direnv` for AI agents, but simpler, safer by default, and built around project and skill scopes.

## Why

AI coding agents need API keys, model provider credentials, database URLs, Cloudflare/Vercel tokens, and workflow-specific settings. Most teams solve that with rough edges:

- exporting secrets globally in `.zshrc`
- copying `.env` files between projects
- remembering wrapper commands like `dotenvx run -- codex`
- accidentally leaking one project's keys into another project

`aiscope` keeps each folder tied to its own local scope.

```bash
cd ~/projects/demo-app
aiscope: loaded project/demo-app
codex

cd ..
aiscope: unloaded project/demo-app
```

## Features

- Automatic env loading when you enter a folder
- Automatic unload when you leave
- Project scopes: `project/demo-app`
- Skill scopes: `skill/frontend-design`
- Central local vault at `~/.aiscope`
- Safe masked `status` output
- Plain `.aiscope.toml` config
- Works with Codex, Claude Code, npm, Python, Node, Wrangler, Vercel, and any CLI
- No wrapper commands
- No shell-sourced env files

## Install

When published to npm:

```bash
npm install -g aiscope
```

Local development install today:

```bash
git clone https://github.com/IUMANMAN/aiscope.git
cd aiscope
npm link
```

## Shell Setup

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

Use skill scopes for reusable AI workflows:

```bash
mkdir frontend-design
cd frontend-design
aiscope init skill frontend-design
aiscope edit
claude
```

## Commands

```bash
aiscope init project <name>  # create a project scope
aiscope init skill <name>    # create a skill scope
aiscope hook zsh             # print zsh hook
aiscope hook bash            # print bash hook
aiscope status               # show active scope and masked keys
aiscope list                 # list known scopes
aiscope edit                 # edit current scope env file
aiscope doctor               # check local setup
aiscope version              # print version
aiscope help                 # print help
```

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
