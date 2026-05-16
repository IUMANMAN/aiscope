# Changelog

## 0.3.0

- Add `aiscope export` for tools that need shell export commands without installing the hook
- Improve package help output and first-run command order
- Make `aiscope link` idempotent and add `--force` for replacing existing symlinks

## 0.2.0

- Add `aiscope link [file]` to link the current scope env file as `.env.local` or another local env filename
- Ignore common local env link files such as `.env.*` and `.dev.vars`

## 0.1.1

- Use npm install as the primary public install path
- Keep development-only docs and examples out of the npm package payload
- Improve npm metadata and public README install flow

## 0.1.0

- Initial CLI
- Project and skill scopes
- zsh/bash hook
- status/list/edit/doctor
