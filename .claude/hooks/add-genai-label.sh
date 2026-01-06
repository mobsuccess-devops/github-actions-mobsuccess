#!/bin/bash
# Hook Stop: Add genai-assisted label to the PR

git rev-parse --is-inside-work-tree > /dev/null 2>&1 || exit 0

if ! command -v gh > /dev/null 2>&1; then
  echo "⚠️  GitHub CLI (gh) non installé. Installe-le pour auto-labeler les PRs:"
  echo "   brew install gh && gh auth login"
  exit 0
fi

# Check if gh is authenticated
if ! gh auth status > /dev/null 2>&1; then
  echo "⚠️  GitHub CLI non authentifié. Lance: gh auth login"
  exit 0
fi

# Get the PR number for the current branch
PR_NUMBER=$(gh pr view --json number --jq '.number' 2>/dev/null)
[ -z "$PR_NUMBER" ] && exit 0

# Check if the label already exists
LABELS=$(gh pr view "$PR_NUMBER" --json labels --jq '.labels[].name' 2>/dev/null)
echo "$LABELS" | grep -q "^genai-assisted$" && exit 0

# Add the label
gh pr edit "$PR_NUMBER" --add-label "genai-assisted" 2>/dev/null
echo "✅ Label 'genai-assisted' ajouté à la PR #$PR_NUMBER"

exit 0
