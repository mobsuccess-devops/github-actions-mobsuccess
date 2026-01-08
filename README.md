# Github Mobsuccess action

[![NPM](https://github.com/mobsuccess-devops/github-actions-mobsuccess/actions/workflows/npm.yml/badge.svg)](https://github.com/mobsuccess-devops/github-actions-mobsuccess/actions/workflows/npm.yml)

This action validates that the various Mobsuccess policies are enforced when
changes are made to the repository. It checks, for example, the title of the
pull request, the names of the branch, and detects GenAI-assisted contributions.

# Install the workflow in repository

You do not need to make any action to install the GitHub Action workflow,
ms-bot will automatically make PRs on your repository when changes are needed.

# ACTIONS

## Changelog

The changelog action allows to generate on a particular repo, a changelog for the last X tags.

The "latest tag" corresponds to a tag that has not been pushed as a release. As this action is based on GH releases, it allows to generate the changelog between the last release and the tag being created right now.

Usage:

```yml
- uses: mobsuccess-devops/github-actions-mobsuccess@master
  with:
    github-token: ${{ github.token }}
    action: changelog
    max-releases: 10 #(optional, default to 10)
    unreleased-tag: 0.0.90289303809 # newly created unreleased tag (optional)
```

## GenAI Detection

The `validate-pr` action automatically detects GenAI-assisted PRs and adds the `genai-assisted` label.

### How it works

The system uses a **unified approach** for all AI coding agents (Claude Code, Cursor, etc.):

```
Agent (Claude Code or Cursor) stops
         ↓
Hook "stop" creates .genai-assisted marker file
         ↓
User commits (from any terminal, IDE, etc.)
         ↓
Git hook "prepare-commit-msg" detects marker
         ↓
Adds "Co-Authored-By: GenAI" + removes marker
         ↓
GitHub Action detects Co-Authored-By → Adds label
```

### Local Setup (for developers)

The git hooks are automatically configured via `npm install` (postinstall script sets `core.hooksPath`).

#### Files involved

| File                           | Purpose                                                         |
| ------------------------------ | --------------------------------------------------------------- |
| `.githooks/prepare-commit-msg` | Adds `Co-Authored-By: GenAI` if `.genai-assisted` marker exists |
| `.cursor/hooks.json`           | Cursor hook: creates `.genai-assisted` when agent stops         |
| `.claude/settings.json`        | Claude Code hook: creates `.genai-assisted` when agent stops    |
| `.genai-assisted`              | Temporary marker file (gitignored)                              |

#### How to enable for your agent

**Claude Code**: Already configured in `.claude/settings.json`

**Cursor**: Already configured in `.cursor/hooks.json`

**Other agents**: Create a hook that runs `touch .genai-assisted` when the agent stops working.

### Detection Triggers (GitHub Action)

The action checks for AI assistance in:

- **PR Author**: GenAI bot accounts (for example, `copilot[bot]`) or users indicating AI usage. Traditional automation bots like Dependabot and Renovate are not treated as GenAI-assisted.
- **Branch Name**: AI-prefixed branches (`cursor/`, `claude/`, `ai/`, `copilot/`, etc.)
- **PR Body**: Mentions of AI tools (Claude, Copilot, ChatGPT, Cursor, etc.)
- **Existing Labels**: AI-related labels (ai-assisted, copilot, claude, etc.)
- **Commits**: Messages containing AI signatures or `Co-Authored-By: GenAI`
- **Commit Timing**: Rapid commits (3+ commits within 30 seconds = AI agent behavior)
- **Comments**: Bot comments or user mentions of AI usage

### Supported AI Tools

Claude, Claude Code, ChatGPT, GPT-4, Copilot, GitHub Copilot, Gemini, Cursor, Windsurf, Codeium, Tabnine, Cody, Aider, Devin, Amazon Q, CodeWhisperer, and many other tools.

### Patterns Detected

```
# Commit signatures (added automatically by hooks)
- Co-Authored-By: GenAI
- Co-Authored-By: Claude <noreply@anthropic.com>
- Generated with [Claude Code](https://claude.ai/code)
- [Copilot] / [Claude] / [ChatGPT] in commit messages

# PR body
- AI-assisted / AI-generated / LLM-assisted
- "Created using Copilot" / "With help from Claude"

# Branch prefixes
- cursor/, claude/, ai/, copilot/, aider/, genai/
```

### Customization

To add new patterns, edit `lib/genaiPatterns.js`. The detection is permissive: a single match triggers the label.
