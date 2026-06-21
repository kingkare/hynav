#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

MESSAGE="${1:-update}"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"

echo "==> 当前分支: $BRANCH"

if [ -n "$(git status --short)" ]; then
  echo "==> 提交本地修改"
  git add -A
  git commit -m "$MESSAGE"
else
  echo "==> 没有需要提交的本地修改"
fi

echo "==> 同步远程最新代码"
git pull --rebase origin "$BRANCH"

echo "==> 推送到 GitHub"
git push origin "$BRANCH"

echo "==> 推送完成"
