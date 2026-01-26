# Github Mobsuccess action

[![NPM](https://github.com/mobsuccess-devops/github-actions-mobsuccess/actions/workflows/npm.yml/badge.svg)](https://github.com/mobsuccess-devops/github-actions-mobsuccess/actions/workflows/npm.yml)

GitHub Action enforcing Mobsuccess policies on repositories.

## Installation

No manual setup required - ms-bot automatically creates PRs when changes are needed.

## Features

| Action        | Description                                                                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `validate-pr` | Validates PR title and branch name conventions, adds branch tag label, detects GenAI-assisted PRs (adds `genai-assisted` label), posts AWS Amplify preview links |
| `changelog`   | Generates changelog for the last X releases                                                                                                                      |

## Usage

### validate-pr

```yml
- uses: mobsuccess-devops/github-actions-mobsuccess@master
  with:
    github-token: ${{ github.token }}
    action: validate-pr
```

### changelog

```yml
- uses: mobsuccess-devops/github-actions-mobsuccess@master
  with:
    github-token: ${{ github.token }}
    action: changelog
    max-releases: 10 # optional, default 10
    unreleased-tag: 0.0.1 # optional, newly created tag
```

## GenAI Detection

Automatically detects AI-assisted PRs and adds the `genai-assisted` label.

**Detection triggers:** PR author (bot accounts), branch prefix (`cursor/`, `claude/`, `ai/`...), PR body mentions, existing AI labels, commit messages (`Co-Authored-By: Claude`, etc.)

**Supported tools:** Claude, Copilot, ChatGPT, Cursor, Gemini, Windsurf, Codeium, Tabnine, Aider, Devin, Amazon Q, and more.

**Customization:** Edit `lib/genaiPatterns.js` to add patterns.

