<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/IUMANMAN/aiscope/main/docs/aiscope-mark-dark.svg">
    <img alt="aiscope" src="https://raw.githubusercontent.com/IUMANMAN/aiscope/main/docs/aiscope-mark.svg" width="108">
  </picture>
</p>

<h1 align="center">aiscope</h1>

<p align="center">
  <strong>为 AI 编程代理自动加载本地作用域。</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/aiscope"><img alt="npm version" src="https://img.shields.io/npm/v/aiscope?color=4ee1a0"></a>
  <a href="https://www.npmjs.com/package/aiscope"><img alt="npm downloads" src="https://img.shields.io/npm/dm/aiscope"></a>
  <a href="https://github.com/IUMANMAN/aiscope/actions/workflows/ci.yml"><img alt="ci" src="https://github.com/IUMANMAN/aiscope/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/IUMANMAN/aiscope/blob/main/LICENSE"><img alt="license" src="https://img.shields.io/github/license/IUMANMAN/aiscope"></a>
  <a href="https://github.com/IUMANMAN/aiscope"><img alt="node" src="https://img.shields.io/badge/node-%3E%3D18-7cc7ff"></a>
  <a href="https://iumanman.github.io/aiscope/"><img alt="pages" src="https://img.shields.io/badge/docs-GitHub%20Pages-4ee1a0"></a>
</p>

<p align="center">
  <a href="./README.md">English</a>
  <span> · </span>
  <a href="https://iumanman.github.io/aiscope/?lang=zh">网站</a>
  <span> · </span>
  <a href="https://www.npmjs.com/package/aiscope">npm</a>
  <span> · </span>
  <a href="https://github.com/IUMANMAN/aiscope/issues">Issues</a>
</p>

<br>

```bash
npm install -g aiscope
eval "$(aiscope hook zsh)"

cd my-app
aiscope use my-app
aiscope set OPENAI_API_KEY sk-...
aiscope dashboard
codex
```

不需要包装命令。不需要全局导出密钥。不需要手动切换环境变量。

`aiscope` 是一个面向 AI 编程工作的本地作用域管理器。进入项目或技能目录时，它会自动加载对应的环境变量；离开目录时，它会自动卸载这些变量。

你可以把它理解成面向 AI agent 的 `direnv`：更简单，更聚焦 project / skill 作用域。

## 为什么开发者会用它

- 不把 AI/API 凭证写进全局 shell 配置。
- 在多个项目之间切换时，不把旧项目环境变量泄漏到新项目。
- 让 Codex、Claude Code、本地 dev server、部署 CLI 和脚本使用同一套 scoped env。
- 通过一个中心化 aiscope vault 管理环境变量。
- 把选中的变量共享给多个项目。
- 当框架需要磁盘上的 env 文件时，仍然兼容 `.env.local`。

## 问题

AI 编程代理经常需要 API key、模型供应商凭证、数据库地址、Cloudflare/Vercel token，以及不同工作流的配置。

很多开发者最后会这样做：

```bash
dotenvx run -- codex
source .env && claude
OPENAI_API_KEY=... codex
```

这些方式都不够顺手，也容易让一个项目的环境变量泄漏到另一个项目。

## aiscope 的方式

```bash
cd ~/projects/demo-app
aiscope: loaded project/demo-app
codex

cd ..
aiscope: unloaded project/demo-app
```

目录决定作用域。在这个目录里启动的任何 CLI，都会自动得到正确的环境变量。

## 亮点

| 能力 | 作用 |
| --- | --- |
| 目录感知作用域 | 进入 scoped folder 后自动加载正确 env。 |
| 自动卸载 | 离开目录后移除上一个作用域的变量。 |
| Project 和 skill | 当前支持 `project/demo-app` 和 `skill/frontend-design`。 |
| 中心化 env 管理 | 在 scoped project 中使用 `aiscope set`、`aiscope unset` 和 `aiscope vars`。 |
| 本地 CLI dashboard | 使用 `aiscope dashboard` 查看 scope、共享 key、链接状态和下一步操作。 |
| 共享变量 | 使用 `aiscope share`、`aiscope shared` 和 `aiscope add` 复用凭证。 |
| 本地 vault | Env 文件集中保存在 `~/.aiscope/vault`。 |
| `.env.local` 链接 | 为需要读取本地 env 文件的框架，把当前 scope 链接成 `.env.local`。 |
| 隐藏密钥输出 | 可以看到加载了哪些 key，但不会打印真实值。 |
| 任意 CLI | 适用于 Codex、Claude Code、npm、Python、Node、Wrangler、Vercel 等工具。 |

## 适用工具

| 工具 | 作用 |
| --- | --- |
| Codex / Claude Code | 在 scoped folder 中启动，provider key 自动可用。 |
| Next.js / Vite | 框架读取 `.env.local` 时使用 `aiscope link`。 |
| Node / Python | 正常读取 `process.env.*` 或 `os.environ`。 |
| Cloudflare Wrangler | 可以链接 `.dev.vars`，也可以直接使用 shell 环境变量。 |
| Vercel / Netlify | 用正确的本地项目 env 运行部署命令。 |

## 安装

从 npm 安装：

```bash
npm install -g aiscope
```

然后启用 shell hook：

```bash
eval "$(aiscope hook zsh)"
```

bash：

```bash
eval "$(aiscope hook bash)"
```

## Shell 设置

永久启用 zsh：

```bash
echo 'eval "$(aiscope hook zsh)"' >> ~/.zshrc
source ~/.zshrc
```

bash：

```bash
echo 'eval "$(aiscope hook bash)"' >> ~/.bashrc
source ~/.bashrc
```

## 快速开始

```bash
mkdir my-app
cd my-app
aiscope use my-app
aiscope set OPENAI_API_KEY sk-...
aiscope vars
aiscope dashboard
aiscope link
codex
```

`aiscope use` 会把当前目录连接到一个中心化 project scope。

`aiscope set` 会把变量写入中心化 aiscope vault。

`aiscope link` 会创建 `.env.local`，并把它作为 symlink 指向当前 scope 的 env 文件。适合 Next.js、Vite 或其他会扫描 `.env.local` 的工具。

## 实际体验

```bash
cd ~/projects/demo-app
aiscope: loaded project/demo-app
codex

cd ..
aiscope: unloaded project/demo-app
```

## Skill 作用域

skill 作用域适合复用型 AI 工作流：

```bash
mkdir frontend-design
cd frontend-design
aiscope init skill frontend-design
aiscope edit
claude
```

## 命令

| 命令 | 说明 |
| --- | --- |
| `aiscope use <name>` | 把当前目录连接到一个中心化 project scope。 |
| `aiscope set <KEY> <VALUE>` | 在当前 scope 中设置变量。 |
| `aiscope unset <KEY>` | 从当前 scope 中删除变量。 |
| `aiscope vars` | 列出当前 scope 的变量，值会被隐藏。 |
| `aiscope dashboard` | 显示当前项目的本地终端 dashboard。 |
| `aiscope shared` | 列出共享 scopes 和它们的 key。 |
| `aiscope shared create <name>` | 创建共享 env scope。 |
| `aiscope share <shared-name> <KEY...>` | 把选中的项目变量复制到共享 scope。 |
| `aiscope add <shared-name>` | 把共享 scope 添加到当前项目。 |
| `aiscope remove <shared-name>` | 从当前项目移除共享 scope。 |
| `aiscope init project <name>` | 创建项目作用域。 |
| `aiscope init skill <name>` | 创建技能作用域。 |
| `aiscope hook zsh` | 输出 zsh shell hook。 |
| `aiscope hook bash` | 输出 bash shell hook。 |
| `aiscope status` | 查看当前作用域和隐藏后的 key。 |
| `aiscope list` | 列出已知作用域。 |
| `aiscope edit` | 编辑当前作用域 env 文件。 |
| `aiscope export` | 输出当前 scope 的安全 shell `export` 命令。 |
| `aiscope link [file]` | 把当前 scope env 文件链接为 `.env.local` 或其他本地文件名。 |
| `aiscope doctor` | 检查本地配置。 |
| `aiscope version` | 输出版本号。 |
| `aiscope help` | 输出帮助。 |

## 配置

每个作用域目录里都有 `.aiscope.toml`：

```toml
type = "project"
name = "demo-app"
env = "~/.aiscope/vault/projects/demo-app.env"
```

skill 作用域：

```toml
type = "skill"
name = "writing-kit"
env = "~/.aiscope/vault/skills/writing-kit.env"
```

作用域名称支持字母、数字、点、短横线和下划线。

大多数用户可以直接使用 `aiscope use <name>`，不需要手动编写这个文件。

## Vault 结构

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

## Env 文件

Env 文件是普通 dotenv 格式：

```dotenv
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
DATABASE_URL="postgresql://localhost/my_app"
```

支持：

- `#` 开头的注释
- 空行
- `KEY=value`
- 带空格的引号值

`aiscope` 会把 env 文件当作数据解析，不会执行它，也不会把它当作 shell 脚本 source。

从 CLI 管理 env：

```bash
aiscope set OPENAI_API_KEY sk-...
aiscope set DATABASE_URL postgresql://localhost/my_app
aiscope vars
aiscope unset DATABASE_URL
```

## 共享变量

共享 scope 适合多个项目都需要的凭证。`aiscope share` 会把选中的 key 复制到共享 scope，并把它添加到当前项目：

```bash
cd app-a
aiscope use app-a
aiscope set OPENAI_API_KEY sk-...
aiscope share openai OPENAI_API_KEY
```

然后在另一个项目中使用同一组共享变量：

```bash
cd ../app-b
aiscope use app-b
aiscope add openai
aiscope vars
```

查看所有共享 groups 和 keys：

```bash
aiscope shared
```

查看某个共享 group：

```bash
aiscope shared openai
```

默认会隐藏变量值。如果同一个 key 同时存在于 project 和 shared scope，project 的值优先。

## 本地 Dashboard

想管理整体配置时：

```bash
aiscope dashboard
```

在真实终端里，`aiscope dashboard` 会打开一个交互式 dashboard，包含这些 tabs：

- `Overview`
- `Projects`
- `Shared`
- `Skills`

快捷键：

| 按键 | 操作 |
| --- | --- |
| `Left` / `Right` | 切换 tabs |
| `Up` / `Down` | 移动选择 |
| `Space` | 给当前 project 添加或移除选中的 shared scope |
| `e` | 编辑选中 scope 的 env 文件 |
| `c` | 在当前 tab 创建 scope |
| `r` | 刷新 |
| `q` | 退出 |

在 scoped project 中，它会显示：

- 当前 project scope
- shell hook 状态
- env 文件路径
- `.env.local` 链接状态
- 已添加的 shared scopes
- project 变量
- shared 变量
- 合并后的变量和覆盖来源
- 推荐下一步操作

不在 scoped project 中时，它会显示全局 vault：

- 所有 projects
- 所有 shared scopes
- 所有 skill scopes
- 每个 scope 的隐藏 keys

脚本或日志里可以使用纯文本输出：

```bash
aiscope dashboard --plain
```

别名：

```bash
aiscope dash
```

## `.env.local` 兼容

大多数命令可以直接读取当前 shell 环境变量：

```js
process.env.OPENAI_API_KEY
```

有些框架也会读取 `.env.local` 这类本地文件。对于这种项目：

```bash
aiscope link
```

它会创建：

```text
.env.local -> ~/.aiscope/vault/projects/demo-app.env
```

也可以指定其他文件名：

```bash
aiscope link .dev.vars
```

这个链接只应该保留在本地，不要提交到 Git。

## 常见用法

Next.js 或 Vite：

```bash
aiscope link
npm run dev
```

Cloudflare Workers：

```bash
aiscope link .dev.vars
wrangler dev
```

Node：

```bash
node -e 'console.log(Boolean(process.env.OPENAI_API_KEY))'
```

Python：

```bash
python -c 'import os; print(bool(os.environ.get("OPENAI_API_KEY")))'
```

排查问题：

```bash
aiscope status
aiscope doctor
```

不安装 hook，只做一次性 shell export：

```bash
eval "$(aiscope export)"
```

## 安全模型

`aiscope` 坚持 local-first：

- 密钥只保存在本机 `~/.aiscope/vault`
- 新 env 文件会尽量使用 `0600` 权限
- 普通 CLI 输出会隐藏密钥值
- hook 会先卸载旧作用域变量，再加载新作用域变量
- 离开作用域目录时会清除 `AISCOPE_*` 元数据和已加载 key
- 默认忽略 `.env` 和 `*.env`

在活动作用域中启动的进程可以读取该作用域的环境变量。这是 shell 环境变量的基本机制，所以作用域应该保持本地、具体、最小化。

## aiscope 不是什么

- 不是云端 secrets manager
- 目前还不是加密 vault
- 不是包装命令运行器
- 不是团队 secrets 基础设施的替代品

`aiscope` 保持小而清晰：本地 scope 进入，本地环境变量输出。

## Roadmap

- 加密本地 vault
- 作用域权限
- AI context 文件
- agent 和 workflow 作用域
- 1Password 集成
- Bitwarden 集成
- 团队共享加密作用域
- VS Code 扩展
- Homebrew 安装
- Windows 支持

## License

MIT
