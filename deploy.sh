#!/bin/bash
set -e

echo "=== 拉取最新代码 ==="
cd /var/www/snowflake/project
git pull origin main

echo "=== 安装依赖 ==="
pnpm install

echo "=== 构建前后端 ==="
pnpm run build

echo "=== 部署前端静态文件 ==="
# 前端产物由 vite 输出到根目录 dist/web（见 apps/web/vite.config.ts 的 outDir）
rm -rf /var/www/snowflake/web/*
cp -r dist/web/* /var/www/snowflake/web/

echo "=== 重启后端服务 ==="
pm2 restart snowflake-server

echo "=== 部署完成 ==="