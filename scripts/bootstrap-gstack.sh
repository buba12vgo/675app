#!/usr/bin/env bash
# Copy this repo's gstack project files into another git repo (new or existing).
# Usage: bash scripts/bootstrap-gstack.sh /path/to/other-repo
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-}"

if [ -z "$DEST" ] || [ ! -d "$DEST" ]; then
  echo "Usage: bash scripts/bootstrap-gstack.sh /path/to/repo" >&2
  exit 1
fi

DEST="$(cd "$DEST" && pwd)"

mkdir -p "$DEST/scripts" "$DEST/.cursor/rules" "$DEST/.cursor/skills" "$DEST/.claude/hooks"

install -m 0755 "$SRC/scripts/install-gstack.sh" "$DEST/scripts/install-gstack.sh"
install -m 0755 "$SRC/scripts/bootstrap-gstack.sh" "$DEST/scripts/bootstrap-gstack.sh"
cp "$SRC/.cursor/rules/gstack.mdc" "$DEST/.cursor/rules/gstack.mdc"
cp "$SRC/.cursor/environment.json" "$DEST/.cursor/environment.json"

if [ -d "$SRC/.cursor/skills" ]; then
  mkdir -p "$DEST/.cursor/skills"
  for d in "$SRC/.cursor/skills"/gstack-*; do
    [ -d "$d" ] || continue
    name="$(basename "$d")"
    mkdir -p "$DEST/.cursor/skills/$name"
    if [ -f "$d/SKILL.md" ]; then
      cp "$d/SKILL.md" "$DEST/.cursor/skills/$name/SKILL.md"
    fi
  done
fi

if [ -f "$SRC/.claude/hooks/check-gstack.sh" ]; then
  install -m 0755 "$SRC/.claude/hooks/check-gstack.sh" "$DEST/.claude/hooks/check-gstack.sh"
fi
if [ -f "$SRC/.claude/settings.json" ]; then
  cp "$SRC/.claude/settings.json" "$DEST/.claude/settings.json"
fi

copy_if_missing() {
  local rel="$1"
  if [ ! -f "$DEST/$rel" ]; then
    cp "$SRC/$rel" "$DEST/$rel"
  fi
}

copy_if_missing AGENTS.md
copy_if_missing CLAUDE.md

if [ -f "$DEST/.gitignore" ]; then
  grep -qF '.gstack/' "$DEST/.gitignore" 2>/dev/null || printf '\n.gstack/\n.gstack-worktrees/\n' >> "$DEST/.gitignore"
else
  printf '.gstack/\n.gstack-worktrees/\n' > "$DEST/.gitignore"
fi

echo "gstack project files copied to $DEST"
echo "Next: (cd \"$DEST\" && bash scripts/install-gstack.sh)"
