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

### Detection Triggers

The action checks for AI assistance in:

- **PR Author**: GenAI bot accounts (for example, `copilot[bot]`) or users indicating AI usage. Traditional automation bots like Dependabot and Renovate are not treated as GenAI-assisted.
- **Branch Name**: AI-prefixed branches (`cursor/`, `claude/`, `ai/`, `copilot/`, etc.)
- **PR Body**: Mentions of AI tools (Claude, Copilot, ChatGPT, Cursor, etc.)
- **Existing Labels**: AI-related labels (ai-assisted, copilot, claude, etc.)
- **Commits**: Messages containing AI signatures or co-authored-by AI
- **Commit Timing**: Rapid commits (3+ commits within 30 seconds = AI agent behavior)
- **Files Changed**: AI config files (`.cursorrules`, `CLAUDE.md`, `.aider*`, etc.)
- **Comments**: Bot comments or user mentions of AI usage

### Supported AI Tools

Claude, Claude Code, ChatGPT, GPT-4, Copilot, GitHub Copilot, Gemini, Cursor, Windsurf, Codeium, Tabnine, Cody, Aider, Devin, Amazon Q, CodeWhisperer, and many other tools.

### Patterns Detected

```
# Commit signatures
- Co-Authored-By: Claude <noreply@anthropic.com>
- Generated with [Claude Code](https://claude.ai/code)
- [Copilot] / [Claude] / [ChatGPT] in commit messages
- 🤖 emoji in commits

# PR body
- AI-assisted / AI-generated / LLM-assisted
- "Created using Copilot" / "With help from Claude"

# Branch prefixes
- cursor/, claude/, ai/, copilot/, aider/, genai/

# AI config files
- CLAUDE.md, .cursorrules, .cursor/, .aider*, .continue/
- .github/copilot-instructions.md, .cody/, .windsurf/
```

### Customization

To add new patterns, edit `lib/genaiPatterns.js`. The detection is permissive: a single match triggers the label.
