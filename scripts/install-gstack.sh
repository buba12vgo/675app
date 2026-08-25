#!/usr/bin/env bash
# Install Garry Tan's gstack for Cursor on this machine.
# Idempotent. Safe to re-run. Do not clone into ~/.cursor/skills/gstack —
# that path is the install target, not the source checkout.
set -euo pipefail

export CI="${CI:-1}"
export GSTACK_SKIP_FONTS="${GSTACK_SKIP_FONTS:-1}"

if [ -x "$HOME/.bun/bin/bun" ]; then
  export PATH="$HOME/.bun/bin:$PATH"
fi

if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
fi

if ! command -v git >/dev/null 2>&1; then
  echo "git is required to install gstack" >&2
  exit 1
fi

GSTACK_SRC="${GSTACK_SRC:-$HOME/gstack}"

# Relocate a mistaken clone that was dropped onto the Cursor install path.
if [ -d "$HOME/.cursor/skills/gstack/.git" ] && [ ! -d "$GSTACK_SRC/.git" ]; then
  mkdir -p "$(dirname "$GSTACK_SRC")"
  mv "$HOME/.cursor/skills/gstack" "$GSTACK_SRC"
fi

if [ ! -d "$GSTACK_SRC/.git" ]; then
  git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git "$GSTACK_SRC"
else
  git -C "$GSTACK_SRC" fetch --depth 1 origin
  git -C "$GSTACK_SRC" reset --hard FETCH_HEAD
fi

(
  cd "$GSTACK_SRC"
  ./setup --host cursor --no-team
)

if [ ! -d "$HOME/.cursor/skills/gstack/bin" ]; then
  echo "gstack install failed: missing $HOME/.cursor/skills/gstack/bin" >&2
  exit 1
fi

echo "GSTACK_OK: $HOME/.cursor/skills/gstack"
echo "Skills: $HOME/.cursor/skills/gstack-*"
