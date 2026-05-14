# Security

Do not paste real secrets, API keys, tokens, or private env files into GitHub issues, pull requests, screenshots, or discussions.

## Reporting Security Issues

Please report security issues privately to the project maintainers. Until a private contact is published, open a minimal public issue asking for a secure contact path without including exploit details or secrets.

## Current Model

- Env values are stored locally under `~/.aiscope/vault`
- `aiscope status` masks values by default
- `aiscope doctor` does not print secret values
- Env files are parsed as dotenv data, not executed as shell scripts
- Generated shell commands quote exported values
- New env files are created with `0600` permissions when possible

## Current Limitations

- The vault is not encrypted yet
- There is no team sharing model yet
- There is no 1Password or Bitwarden integration yet
- Shell environments are process-local, so any process launched inside a scope can read active variables
