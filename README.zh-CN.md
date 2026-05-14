# aiscope

**为 AI 编程代理自动加载本地作用域。**

[English README](./README.md) · [GitHub Pages](https://iumanman.github.io/aiscope/) · [Issues](https://github.com/IUMANMAN/aiscope/issues)

```bash
cd ~/ai/projects/clip-brief
codex
```

不需要包装命令。不需要全局导出密钥。不需要手动切换环境变量。

`aiscope` 是一个面向 AI 编程工作的本地作用域管理器。进入项目或技能目录时，它会自动加载对应的环境变量；离开目录时，它会自动卸载这些变量。

你可以把它理解成面向 AI agent 的 `direnv`：更简单，更聚焦 project / skill 作用域。

## 为什么需要

AI 编程代理经常需要 API key、模型供应商凭证、数据库地址、Cloudflare/Vercel token，以及不同工作流的配置。常见做法都有问题：

- 把密钥全局写进 `.zshrc`
- 在不同项目之间复制 `.env`
- 每次都记住 `dotenvx run -- codex` 这类包装命令
- 一个项目的密钥意外泄漏到另一个项目

`aiscope` 让每个目录绑定自己的本地作用域。

```bash
cd ~/ai/projects/manman-blog
aiscope: loaded project/manman-blog
codex

cd ..
aiscope: unloaded project/manman-blog
```

## 功能

- 进入目录时自动加载环境变量
- 离开目录时自动卸载环境变量
- 项目作用域：`project/manman-blog`
- 技能作用域：`skill/frontend-design`
- 本地中心 vault：`~/.aiscope`
- `status` 输出自动隐藏密钥值
- 简单的 `.aiscope.toml` 配置
- 适用于 Codex、Claude Code、npm、Python、Node、Wrangler、Vercel 和任何 CLI
- 不需要包装命令
- 不会直接 source env 文件

## 安装

发布到 npm 后：

```bash
npm install -g aiscope
```

当前可以本地开发安装：

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

```bash
aiscope init project <name>  # 创建项目作用域
aiscope init skill <name>    # 创建技能作用域
aiscope hook zsh             # 输出 zsh hook
aiscope hook bash            # 输出 bash hook
aiscope status               # 查看当前作用域和隐藏后的 key
aiscope list                 # 列出已知作用域
aiscope edit                 # 编辑当前作用域 env 文件
aiscope doctor               # 检查本地配置
aiscope version              # 输出版本号
aiscope help                 # 输出帮助
```

## 配置

每个作用域目录里都有 `.aiscope.toml`：

```toml
type = "project"
name = "manman-blog"
env = "~/.aiscope/vault/projects/manman-blog.env"
```

skill 作用域：

```toml
type = "skill"
name = "blog-markdown"
env = "~/.aiscope/vault/skills/blog-markdown.env"
```

作用域名称支持字母、数字、点、短横线和下划线。

## Vault 结构

```text
~/.aiscope/
  vault/
    projects/
      manman-blog.env
    skills/
      blog-markdown.env
  scopes/
    projects/
      manman-blog.md
    skills/
      blog-markdown.md
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
