# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitHub Actions Mobsuccess is a GitHub Action that enforces Mobsuccess compliance policies in repositories. It validates pull request titles, branch names, and other repository standards during CI/CD workflows.

## Commands

```bash
npm ci                # Install dependencies
npm run eslint        # Lint JavaScript code
npm run prettier      # Check code formatting
npm run test          # Run tests with coverage (Jest)
```

## Architecture

**Entry Point Flow**: `index.js` → `action.js` (dispatcher) → specific action handler in `lib/actions/`

**Three Main Actions**:

- `validate-pr`: Validates branch names and PR titles against conventions
- `after-pr-merged`: Post-merge automation (rebase notifications for sub-branches)
- `changelog`: Generates changelog from releases and PRs

**Key Modules**:

- `lib/branch.js`: Branch naming convention validator (regex-based)
- `lib/pullRequest.js`: PR title validation (Conventional Commits format)
- `lib/actions/pullRequest.js`: Full PR validation logic including GitHub API calls
- `lib/actions/octokit.js`: GitHub API client wrapper

## Conventions

**Branch Naming**: `{type}/{name}` where type is one of: `feat|fix|hotfix|chore|docs|refactor|test|revert|ci|perf|style|build|change|remove|poc|mobsuccessbot|dependabot`

Special prefixes: `renovate/`, `copilot/`, `claude/`, `crowdin/update-translations`

**Sub-branches**: Branches based on non-main branches must use `baseRef--` prefix (e.g., `develop--feat/something`)

**PR Titles**: Conventional Commits format: `{type}({scope})!: {description}`

- Types: `hotfix|feat|fix|chore|docs|refactor|test|revert|build|ci|perf|style|change|remove|poc`
- Scope and `!` (breaking change marker) are optional
- Revert format: `revert {original message}`

## Testing

Tests use Jest with parametrized test cases (`test.each()`). Run `npm run test` for coverage report.

Test files mirror source files: `lib/branch.test.js`, `lib/pullRequest.test.js`
