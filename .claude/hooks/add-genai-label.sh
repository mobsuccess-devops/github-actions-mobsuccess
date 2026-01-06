#!/bin/bash
# Hook Stop: Ajoute le label genai-assisted à la PR ouverte

# Vérifie si on est dans un repo git
git rev-parse --is-inside-work-tree > /dev/null 2>&1 || exit 0

# Vérifie si gh est disponible - EXIGE l'installation
if ! command -v gh > /dev/null 2>&1; then
  echo "⚠️  GitHub CLI (gh) non installé. Installe-le pour auto-labeler les PRs:"
  echo "   brew install gh && gh auth login"
  exit 0
fi

# Vérifie si gh est authentifié
if ! gh auth status > /dev/null 2>&1; then
  echo "⚠️  GitHub CLI non authentifié. Lance: gh auth login"
  exit 0
fi

# Récupère le numéro de la PR ouverte pour la branche courante
PR_NUMBER=$(gh pr view --json number --jq '.number' 2>/dev/null)
[ -z "$PR_NUMBER" ] && exit 0

# Vérifie si le label existe déjà
LABELS=$(gh pr view "$PR_NUMBER" --json labels --jq '.labels[].name' 2>/dev/null)
echo "$LABELS" | grep -q "^genai-assisted$" && exit 0

# Ajoute le label
gh pr edit "$PR_NUMBER" --add-label "genai-assisted" 2>/dev/null
echo "✅ Label 'genai-assisted' ajouté à la PR #$PR_NUMBER"

exit 0
