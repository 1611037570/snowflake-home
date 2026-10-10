// PM2 进程配置：用于生产环境启动 NestJS 后端
const path = require("path");

module.exports = {
  apps: [
    {
      name: "snowflake_server", // PM2 进程名
      script: "dist/server/main.js", // 后端构建产物入口（nest build 输出到 dist/server）
      cwd: __dirname, // 运行目录固定为仓库根，保证相对路径与依赖解析正确
      instances: 1, // 进程实例数
      autorestart: true, // 崩溃后自动重启
      env: {
        NODE_ENV: "production", // 生产环境标识
        // pnpm 严格依赖结构下 @nestjs 等依赖只软链在 apps/server/node_modules，
        // 需显式补充模块查找路径，避免启动时报 MODULE_NOT_FOUND
        NODE_PATH: path.join(__dirname, "apps/server/node_modules"),
      },
    },
  ],
};
