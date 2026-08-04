// Vitest 测试配置
// 导入路径与配置工具
import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// https://juejin.cn/post/7363147365678743593

// 合并基础配置与 Vitest 测试配置
export default mergeConfig(
  viteConfig({ mode: 'test' }),
  // Vitest 配置对象
  defineConfig({
    // 测试选项
    test: {
      globals: true, // 开启全局测试 APIs
      environment: 'jsdom', // 浏览器环境模拟
      exclude: [...configDefaults.exclude, 'e2e/*'], // 排除 e2e 测试
      root: fileURLToPath(new URL('./', import.meta.url)), // 测试根目录
      reporters: ['verbose', 'html', 'json'], // 测试报告输出
      // 报告输出路径
      outputFile: {
        json: './test/json-report.json', // JSON 报告
        html: './test/index.html', // HTML 报告
      },
      // 覆盖率设置
      coverage: {
        provider: 'v8', // 使用 v8 引擎计算覆盖率
        enabled: true, // 启用覆盖率
        reporter: [
          // 'text',
          // 'json',
          'html',
        ], // 覆盖率报告格式
        reportsDirectory: './test/coverage', // 覆盖率报告输出目录
      },
    },
  }),
)
