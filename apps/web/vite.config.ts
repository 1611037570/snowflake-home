import { readEnvironment } from "./src/configs/env";
// 路径处理模块
import { fileURLToPath, URL } from "node:url";
// Node文件系统模块
import { writeFileSync } from "node:fs";

// Tailwind CSS插件
import tailwindcss from "@tailwindcss/vite";
// Vue 3 插件
import vue from "@vitejs/plugin-vue";
// 包大小可视化工具
import { visualizer } from "rollup-plugin-visualizer";
// 自动导入工具
import AutoImport from "unplugin-auto-import/vite";
// Element Plus组件解析器
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
// 组件自动导入工具
import Components from "unplugin-vue-components/vite";
// Vite配置定义函数
import { defineConfig, loadEnv, type Plugin } from "vite";
// 静态资源压缩插件
import viteCompression from "vite-plugin-compression";
// HTML处理插件
import { createHtmlPlugin } from "vite-plugin-html";
// 开发服务器自动重启工具
import ViteRestart from "vite-plugin-restart";
// 移动端调试工具
import vconsole from "vite-plugin-vconsole";
// Vue DevTools 调试工具
import vueDevTools from "vite-plugin-vue-devtools";
// 自定义组件解析器
import { dynamicComponentResolver } from "./src/components";
// Element Plus 按需样式导入
import ElementPlus from "unplugin-element-plus/vite";
// Tiny Vue 组件解析器
import { TinyVueSingleResolver } from "@opentiny/unplugin-tiny-vue";
import { resolveSiteMetadata } from "./site.config";

/**
 * 版本注入插件
 * 构建时根据时间戳自动生成版本号，注入到源码常量并写回 public/version.json
 */
function versionPlugin() {
  // 时间戳版本号，打包间隔不会重复
  const version = String(Date.now());
  return {
    name: "version-inject",
    config() {
      return {
        // 注入全局常量，供 src/configs/modules/version.ts 使用
        define: {
          __APP_VERSION__: JSON.stringify(version),
          // 注入 TINY_MODE 环境变量，用于判断平台
          "process.env": { TINY_MODE: "mobile" },
        },
      };
    },
    configResolved(resolved: any) {
      // 仅构建时写回 version.json，保证与打包版本一致
      if (resolved.command === "build") {
        const versionJsonPath = fileURLToPath(new URL("./public/version.json", import.meta.url));
        writeFileSync(versionJsonPath, JSON.stringify({ version }, null, 2), "utf-8");
      }
    },
  };
}

function copyrightPlugin(): Plugin {
  const copyright = "Copyright (c) 2026 Snowflake. Licensed under MIT.";
  return {
    name: "copyright-watermark",
    outputOptions(outputOptions: any) {
      // Preserve the copyright notice in every generated script.
      return {
        ...outputOptions,
        banner: `/*! ${copyright} */`,
      };
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "COPYRIGHT.txt",
        source: `${copyright}\n`,
      });
    },
  };
}

/**
 * 首屏样式异步化插件
 * Vite 会在 HTML 中注入入口样式表，大体积 CSS 会阻塞首屏渲染，爬虫也需等待其下载完成。
 * 这里在产物生成后改为预加载，加载完成时再提升为样式表，并用 noscript 保留同步兜底。
 */
function asyncStylePlugin(): Plugin {
  return {
    name: "async-entry-style",
    // 关键：必须排在 vite:build-html 之后执行，否则产物 HTML 尚未注入样式表，改写会静默失效
    enforce: "post",
    generateBundle(_options, bundle) {
      // 未生成 HTML 产物时直接跳过，避免误改其他资源
      const htmlAsset = Object.values(bundle).find((item) => item.fileName === "index.html");
      if (!htmlAsset || htmlAsset.type !== "asset") return;
      // HEAD 中的样式表一律转为异步加载，异步 chunk 的样式由动态 import 自行携带
      htmlAsset.source = String(htmlAsset.source).replace(
        /<link([^>]*?)rel="stylesheet"([^>]*?)\/?>/g,
        (_match, before: string, after: string) => {
          const attributes = `${before} ${after}`.trim();
          // 加载完成后由内联脚本提升为样式表，保证 CSS 就绪即生效而不阻塞首屏
          return `<link ${attributes} rel="preload" as="style" onload="this.rel='stylesheet'"><noscript><link ${attributes} rel="stylesheet"></noscript>`;
        },
      );
    },
  };
}

// Vite配置导出
export default ({ mode }: { mode: string }) => {
  // 从环境文件加载环境变量
  const env = loadEnv(mode, process.cwd());
  const isProd = mode === "production";
  // 从环境变量中提取配置项
  const settings = readEnvironment(env);
  return defineConfig({
    // 将 .awebp（动画 webp）视为静态资源
    assetsInclude: ["**/*.awebp"],
    // 基础路径配置
    base: settings.baseUrl,
    // 后台文件封装使用模块输出，支持封装库的按需依赖。
    worker: {
      format: "es", // 后台脚本模块格式
    },
    // 开发服务器配置
    server: {
      port: settings.port, // 端口号
      host: true, // 允许外部访问
      open: true, // 自动打开浏览器
      hmr: true, // 启用服务端渲染
    },
    plugins: [
      // 版本注入插件（自动生成时间戳版本号）
      versionPlugin(),
      copyrightPlugin(),
      // 首屏样式异步加载（避免大体积 CSS 阻塞渲染）
      asyncStylePlugin(),
      // Vue 3 插件配置
      vue(),
      // Tailwind CSS插件配置
      tailwindcss(),
      // HTML插件配置
      createHtmlPlugin({
        minify: isProd, // 开启HTML压缩
        // 注入 HTML 变量（HTML 中通过 <%= 变量名 %> 使用）
        inject: {
          data: {
            defaultLang: settings.defaultLanguage, // 默认语言
            // 初始 HTML 与客户端按同一入口路由选择产品信息。
            siteMetadata: resolveSiteMetadata(
              settings.defaultRoute,
              settings.defaultLanguage,
              settings.defaultRoute,
            ),
          },
        },
      }),
      // 自动导入配置
      AutoImport({
        resolvers: [ElementPlusResolver(), TinyVueSingleResolver], // Element Plus解析器
        imports: [
          "vue",
          "vue-router",
          "@vueuse/core",
          "pinia",
          {
            "@/locales": ["$t"],
            "@/utils": ["routerNavigation", "urlNavigation", "$s"],
          },
        ], // 自动导入模块
        dts: "src/types/autoImports.d.ts", // 类型声明文件路径
      }),
      // 组件自动注册配置
      Components({
        resolvers: [ElementPlusResolver(), dynamicComponentResolver(), TinyVueSingleResolver], // 组件解析器列表
        dts: "src/types/components.d.ts", // 类型声明文件路径
        dirs: ["src/components"], // 要搜索组件的目录
        extensions: [".vue"], // 要处理的组件文件扩展名
        deep: false, // 是否深度搜索子目录
      }),
      // Element Plus 按需样式导入
      ElementPlus({}),
      // 仅在开发环境启用
      ...(isProd
        ? []
        : [
            // Vue DevTools调试
            vueDevTools(),
            // 移动端调试工具
            vconsole({
              entry: "src/main.ts", // 入口文件
            }),
            // 开发服务器自动重启
            ViteRestart({
              restart: ["vite.config.ts"], // 监听这些文件的变化，触发服务器重启
            }),
          ]),
      // 资源压缩配置：产出 gzip 静态压缩文件，配合服务端 gzip_static 使用
      viteCompression({
        verbose: false, // 输出压缩日志
        disable: isProd ? false : true, // 生产环境启用
        threshold: 8192, // 文件大小阈值
        algorithm: "gzip", // 压缩算法
        ext: ".gz", // 压缩文件后缀
        deleteOriginFile: false, // 是否删除源文件
      }),
    ],
    // 路径解析配置
    resolve: {
      // 路径别名配置
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)), // @别名指向src目录
        "@components": fileURLToPath(new URL("./src/components", import.meta.url)), // 组件目录别名
        "@views": fileURLToPath(new URL("./src/views", import.meta.url)), // 视图目录别名
      },
    },

    // esbuild配置
    esbuild: {
      drop: isProd ? ["console", "debugger"] : [], // 移除打印信息
    },

    // 构建配置
    build: {
      outDir: "../../dist/web", // 项目打包根目录（根目录 dist/web）
      emptyOutDir: true, // 输出目录在项目根之外，需显式清空
      assetsDir: "assets", // 静态资源目录
      chunkSizeWarningLimit: 1000, // 警告阈值
      // 关闭产物体积统计输出，缩短构建耗时
      reportCompressedSize: false,
      // minify: 'terser', // 代码压缩
      // Rollup配置
      rollupOptions: {
        // input: {
        //   popup: './public/popup.html', // 关联Vite打包后的popup.html（Vue页面）
        //   'content-script': './src/extension/content-script.ts', // 关联Vite打包后的content-script.js（内容脚本）
        //   // index: './index.html',
        // },
        experimentalLogSideEffects: false, // 实验性日志副作用
        plugins: [
          // 包大小可视化
          visualizer({
            filename: "../../dist/web/stats.html", // 打包分析报告路径
            open: false, // 自动打开报告
            gzipSize: true, // 显示gzip压缩后的大小
            brotliSize: true, // 显示brotli压缩后的大小
          }) as any,
        ],
        output: {
          manualChunks: (id) => {
            // 业务源码：除扩展脚本外交回 Rollup，按入口与动态 import 自动分包
            if (!id.includes("node_modules")) {
              // 这里打包content-script.ts为content-script.js
              if (id.includes("content-script")) {
                return "content-script";
              }
              return;
            }
            // 重型页面库：仅特定功能使用，独立成包便于按需拉取与长期缓存
            if (id.includes("/echarts/")) {
              return "echarts";
            }
            if (id.includes("wangeditor")) {
              return "wangeditor";
            }
            if (id.includes("/html2canvas/")) {
              return "html2canvas";
            }
            if (id.includes("/snapdom/")) {
              return "snapdom";
            }
            if (id.includes("/pica/")) {
              return "pica";
            }
            // Vue 运行时生态：框架核心、路由、状态、语言包与组合式工具库，
            // 它们在入口静态依赖内，独立成包只是为了跨版本复用缓存，不会额外引入动态库
            if (
              /\/node_modules\/(?:vue|vue-router|vue-i18n|pinia|@vueuse|@vue\/[a-z-]+)\//.test(id)
            ) {
              return "vendor-vue";
            }
            // 通用工具库：入口已静态依赖，成包后便于长期缓存
            if (/\/node_modules\/(?:lodash-es|dayjs|mitt|idb-keyval)\//.test(id)) {
              return "vendor-utils";
            }
            // 其余第三方依赖交回 Rollup 按真实引用关系分配到入口或动态 chunk。
            // 注：vue-draggable 与 qrcode 此前在此单独成包，会被提升为入口静态依赖，
            // 反而随首屏一起 preload；统一兜底为 vendor 也有同样问题，故不再对其分组。
            return;
          },
        },
      },
    },
  });
};
