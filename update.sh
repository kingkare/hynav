#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/hynav}"
APP_NAME="${APP_NAME:-hynav}"
PORT="${PORT:-3002}"
RESTART_MODE="${RESTART_MODE:-auto}"
KEEP_BACKUPS="${KEEP_BACKUPS:-5}"

cd "$APP_DIR"

echo "==> 当前目录: $APP_DIR"

if [ -d data ]; then
  mkdir -p backups
  BACKUP_FILE="backups/data-$(date +%Y%m%d-%H%M%S).tar.gz"
  tar -czf "$BACKUP_FILE" data
  ls -1t backups/data-*.tar.gz | tail -n +"$((KEEP_BACKUPS + 1))" | xargs -r rm -f
  echo "==> 已备份 data 到 $BACKUP_FILE，仅保留最近 $KEEP_BACKUPS 份备份"
fi

echo "==> 拉取 GitHub 最新代码"
git pull --ff-only

if [ "$RESTART_MODE" = "docker" ]; then
  echo "==> 使用 Docker Compose 更新"
  docker compose up -d --build
  echo "==> Docker 更新完成，1Panel 反向代理保持指向 http://127.0.0.1:$PORT"
  exit 0
fi

echo "==> 安装依赖"
npm install

echo "==> 构建项目"
npm run build

restart_done=0

if [ "$RESTART_MODE" = "auto" ] || [ "$RESTART_MODE" = "pm2" ]; then
  if command -v pm2 >/dev/null 2>&1 && pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    echo "==> 使用 PM2 重启 $APP_NAME"
    pm2 restart "$APP_NAME"
    restart_done=1
  fi
fi

if [ "$restart_done" = "1" ]; then
  echo "==> 更新完成，1Panel 反向代理继续指向 http://127.0.0.1:$PORT"
  exit 0
fi

echo "==> 代码已更新并构建完成"
echo "==> 没有检测到可自动重启的 PM2 进程: $APP_NAME"
echo "==> 你当前是 1Panel 反向代理模式，反向代理只负责转发，不负责启动 Node.js"
echo "==> 请先执行: pm2 start npm --name $APP_NAME -- run start"
echo "==> 反向代理目标保持: http://127.0.0.1:$PORT"
