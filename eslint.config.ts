// 导入 ESLint 配置相关模块
import { globalIgnores } from "eslint/config";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";
import pluginOxlint from "eslint-plugin-oxlint";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";

// 如需在 .vue 文件中支持更多语言而非仅 'ts'，请取消以下注释：
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// 更多信息：https://github.com/vuejs/eslint-config-typescript/#advanced-setup

// 使用 Vue + TypeScript 配置创建 ESLint 配置
export default defineConfigWithVueTs(
  // 配置需要 lint 的文件范围
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"], // 包含 TypeScript 和 Vue 文件
  },

  // 配置全局忽略的文件路径
  globalIgnores([
    "**/dist/**", // 忽略构建输出目录
    "**/dist-ssr/**", // 忽略 SSR 构建输出目录
    "**/coverage/**", // 忽略测试覆盖率报告目录
  ]),

  // 启用 Vue 必要的 ESLint 规则
  pluginVue.configs["flat/essential"],

  // 启用推荐的 TypeScript ESLint 规则
  vueTsConfigs.recommended,

  // 启用推荐的 Oxlint 规则（高性能 ESLint 替代品）
  ...pluginOxlint.configs["flat/recommended"],

  // 跳过格式化相关规则（由 Prettier 处理）
  skipFormatting,

  // 自定义规则配置
  {
    rules: {
      // 关闭 Vue 块语言检查（允许在 Vue 文件中使用任意语言）
      "vue/block-lang": "off",
      // 关闭 Vue 组件名称必须为多单词的检查
      "vue/multi-word-component-names": "off",
      // 允许使用 any 类型
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
