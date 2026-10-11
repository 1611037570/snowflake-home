// 将 Playwright 浏览器内核固定安装到仓库内的缓存目录，
// 避免安装用户与运行用户 HOME 不同（如 root 安装、www 运行）导致运行时定位不到内核
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// 脚本位于 apps/server/scripts，上一级即后端包目录
const serverDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// 与运行时读取的目录保持一致，见 src/configs/env.ts
const browsersPath = resolve(serverDir, '../../.cache/ms-playwright')

execFileSync(
  process.execPath,
  [resolve(serverDir, 'node_modules/playwright/cli.js'), 'install', 'chromium'],
  {
    // 输出直接透传到当前终端，便于观察下载进度
    stdio: 'inherit',
    env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: browsersPath },
  },
)
