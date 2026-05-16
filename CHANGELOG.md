# Changelog

## 0.6.0

- Add `aiscope dashboard` and `aiscope dash` for a local terminal dashboard
- Show current scope, hook state, `.env.local` link status, shared scopes, masked variables, overrides, and next actions
- Show all projects, shared scopes, skill scopes, and masked keys when dashboard is run outside a scoped folder

## 0.5.0

- Add shared env scopes for variables reused across projects
- Add `aiscope shared`, `aiscope shared create`, `aiscope add`, `aiscope remove`, and `aiscope share`
- Merge shared variables into activation/export, with project variables taking priority

## 0.4.0

- Add `aiscope use <name>` for the simplest project setup flow
- Add `aiscope set`, `aiscope unset`, and `aiscope vars` for central env variable management
- Preserve the central vault model while making project usage feel like `.env.local`

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
