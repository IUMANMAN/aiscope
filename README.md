# aiscope

Auto-loading local scopes for AI coding agents.

```bash
cd ~/ai/projects/clip-brief
codex
```

No wrapper command. No global secrets. No manual env switching.

## Problem

AI coding agents need API keys and project context, but developers often end up with fragile workflows:

- export secrets globally in shell config
- manually copy `.env` files
- use wrapper commands
- leak keys across projects

## Solution

`aiscope` gives every project or skill its own local scope.

When you enter the folder, env loads. When you leave, env unloads.

It feels like `direnv` for AI coding agents, but simpler and focused on project and skill scopes.

## Features

- Automatic env loading by folder
- Automatic unload when leaving
- Project and skill scopes
- Central local vault in `~/.aiscope`
- Safe masked status output
- Works with Codex, Claude Code, npm, Python, Node, Wrangler, Vercel, and any CLI
- Simple `.aiscope.toml`
- No wrapper commands

## Install

```bash
npm install -g aiscope
```

Local development install:

```bash
git clone https://github.com/YOUR_USERNAME/aiscope.git
cd aiscope
npm link
```

## Setup

For zsh:

```bash
eval "$(aiscope hook zsh)"
```

Permanent setup:

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

## Skill Example

```bash
mkdir blog-markdown
cd blog-markdown
aiscope init skill blog-markdown
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
name = "manman-blog"
env = "~/.aiscope/vault/projects/manman-blog.env"
```

Skill scopes use:

```toml
type = "skill"
name = "blog-markdown"
env = "~/.aiscope/vault/skills/blog-markdown.env"
```

## Env Files

Env files are plain dotenv files stored in the local vault:

```dotenv
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
DATABASE_URL="postgresql://localhost/my_app"
```

`aiscope` parses env files safely. It does not source them as shell scripts.

## Security Model

- Secrets live in `~/.aiscope/vault`
- Env values are masked in normal output
- Env files are local to your machine
- No global export is required
- Variables unload when leaving a scope
- New env files are created with `0600` permissions when possible

Do not commit vault env files. Do not paste real secrets into issues.

## Comparison

| Tool | Main idea | AI scope support |
| --- | --- | --- |
| direnv | folder env loading | generic |
| dotenvx | dotenv loading/encryption | generic |
| mise | dev tools + env | generic |
| aiscope | AI project/skill scopes | built-in |

## Roadmap

- encrypted vault
- scope permissions
- AI context files
- 1Password integration
- Bitwarden integration
- team-shared encrypted scopes
- VS Code extension
- Homebrew install
- Windows support

## License

MIT
