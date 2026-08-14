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
rm -rf /var/www/snowflake/web/*
cp -r apps/web/dist/* /var/www/snowflake/web/

echo "=== 重启后端服务 ==="
pm2 restart snowflake-server

echo "=== 部署完成 ==="