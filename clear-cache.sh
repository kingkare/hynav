#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/hynav}"
APP_NAME="${APP_NAME:-hynav}"
FULL_CLEAN="${FULL_CLEAN:-0}"

cd "$APP_DIR"

echo "==> 当前目录: $APP_DIR"
echo "==> 清理 Next.js 构建缓存"
rm -rf .next .turbo .cache node_modules/.cache

if [ "$FULL_CLEAN" = "1" ]; then
  echo "==> FULL_CLEAN=1，清理 node_modules 后重新安装依赖"
  rm -rf node_modules
fi

echo "==> 清理 npm 缓存"
npm cache clean --force

if command -v pm2 >/dev/null 2>&1; then
  echo "==> 清理 PM2 日志"
  pm2 flush "$APP_NAME" || true
fi

echo "==> 安装依赖"
npm install

echo "==> 重新构建"
npm run build

if command -v pm2 >/dev/null 2>&1 && pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  echo "==> 使用 PM2 重启 $APP_NAME"
  pm2 restart "$APP_NAME"
else
  echo "==> 未检测到 PM2 进程 $APP_NAME，请先执行:"
  echo "    pm2 start npm --name $APP_NAME -- run start"
fi

echo "==> 缓存清理完成"
