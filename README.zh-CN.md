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
  <a href="https://github.com/IUMANMAN/aiscope"><img alt="install" src="https://img.shields.io/badge/install-from%20GitHub-4ee1a0"></a>
  <a href="https://github.com/IUMANMAN/aiscope/blob/main/LICENSE"><img alt="license" src="https://img.shields.io/github/license/IUMANMAN/aiscope"></a>
  <a href="https://github.com/IUMANMAN/aiscope"><img alt="node" src="https://img.shields.io/badge/node-%3E%3D18-7cc7ff"></a>
  <a href="https://iumanman.github.io/aiscope/"><img alt="pages" src="https://img.shields.io/badge/docs-GitHub%20Pages-4ee1a0"></a>
</p>

<p align="center">
  <a href="./README.md">English</a>
  <span> · </span>
  <a href="https://iumanman.github.io/aiscope/">网站</a>
  <span> · </span>
  <a href="https://github.com/IUMANMAN/aiscope/issues">Issues</a>
</p>

<br>

```bash
cd ~/projects/demo-app
codex
```

不需要包装命令。不需要全局导出密钥。不需要手动切换环境变量。

`aiscope` 是一个面向 AI 编程工作的本地作用域管理器。进入项目或技能目录时，它会自动加载对应的环境变量；离开目录时，它会自动卸载这些变量。

你可以把它理解成面向 AI agent 的 `direnv`：更简单，更聚焦 project / skill 作用域。

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
| 本地 vault | Env 文件集中保存在 `~/.aiscope/vault`。 |
| 隐藏密钥输出 | 可以看到加载了哪些 key，但不会打印真实值。 |
| 任意 CLI | 适用于 Codex、Claude Code、npm、Python、Node、Wrangler、Vercel 等工具。 |

## 安装

直接从 GitHub 安装，不需要 npm registry 账号：

```bash
npm install -g github:IUMANMAN/aiscope
```

以后如果发布到 npm registry，也可以使用更短的命令：

```bash
npm install -g aiscope
```

现在可以从源码使用：

```bash
git clone https://github.com/IUMANMAN/aiscope.git
cd aiscope
npm link
```

## Shell 设置

zsh：

```bash
eval "$(aiscope hook zsh)"
```

永久启用：

```bash
echo 'eval "$(aiscope hook zsh)"' >> ~/.zshrc
source ~/.zshrc
```

bash：

```bash
eval "$(aiscope hook bash)"
```

## 快速开始

```bash
mkdir my-app
cd my-app
aiscope init project my-app
aiscope edit
codex
```

`aiscope edit` 会使用 `$EDITOR` 打开作用域 env 文件；如果没有设置 `$EDITOR`，则使用 `nano`。

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
| `aiscope init project <name>` | 创建项目作用域。 |
| `aiscope init skill <name>` | 创建技能作用域。 |
| `aiscope hook zsh` | 输出 zsh shell hook。 |
| `aiscope hook bash` | 输出 bash shell hook。 |
| `aiscope status` | 查看当前作用域和隐藏后的 key。 |
| `aiscope list` | 列出已知作用域。 |
| `aiscope edit` | 编辑当前作用域 env 文件。 |
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

## 安全模型

`aiscope` 坚持 local-first：

- 密钥只保存在本机 `~/.aiscope/vault`
- 新 env 文件会尽量使用 `0600` 权限
- 普通 CLI 输出会隐藏密钥值
- hook 会先卸载旧作用域变量，再加载新作用域变量
- 离开作用域目录时会清除 `AISCOPE_*` 元数据和已加载 key
- 默认忽略 `.env` 和 `*.env`

在活动作用域中启动的进程可以读取该作用域的环境变量。这是 shell 环境变量的基本机制，所以作用域应该保持本地、具体、最小化。

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
