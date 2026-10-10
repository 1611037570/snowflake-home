// PM2 进程配置：用于生产环境启动 NestJS 后端
module.exports = {
  apps: [
    {
      name: 'snowflake_server', // PM2 进程名
      script: 'dist/server/main.js', // 后端构建产物入口（nest build 输出到 dist/server）
      cwd: __dirname, // 运行目录固定为仓库根，保证相对路径与依赖解析正确
      instances: 1, // 进程实例数
      autorestart: true, // 崩溃后自动重启
      env: {
        NODE_ENV: 'production', // 生产环境标识
      },
    },
  ],
}
