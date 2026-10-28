import type { Plugin } from "vite";
import { SITE_CONFIGS, type CatalogCounts } from "../site.config";
import type { ExampleSection } from "../src/views/resume/seo/catalog";
import { resolvePageSeo } from "../src/views/resume/seo/page";
import { replaceSeoHead } from "./seoHead";
import { getExampleSourceFiles, readExampleSections } from "./exampleSections";

const virtualId = "virtual:resume-public-sections";
const resolvedVirtualId = `\0${virtualId}`;

/** 为公开页面输出独立网页，并为浏览器提供相同的范本正文。 */
export function publicPagesPlugin(siteUrl: string, language: string, entryRoute: string, counts: CatalogCounts, historyMode = true): Plugin {
  let root = "";
  let sections: Record<string, ExampleSection[]>;
  const origin = siteUrl.replace(/\/+$/, "");
  let base = "/";
  return {
    name: "resume-public-pages", // 静态正文与共享数据插件名称。
    enforce: "post", // 在通用入口网页生成后派生各路由网页。
    configResolved(config) {
      root = config.root;
      base = config.base;
    },
    buildStart() {
      sections = readExampleSections(root);
      // 正文变化时使构建缓存失效，开发环境同时支持文件监听。
      getExampleSourceFiles(root).forEach((path) => this.addWatchFile(path));
    },
    resolveId(id) {
      if (id === virtualId) return resolvedVirtualId;
    },
    load(id) {
      if (id === resolvedVirtualId) return `export default ${JSON.stringify(sections ?? readExampleSections(root))};`;
    },
    // 修改范本后刷新共享正文，开发时不必重启服务才能看到提取结果。
    handleHotUpdate(context) {
      if (![...getExampleSourceFiles(root).values()].includes(context.file)) return;
      sections = readExampleSections(root);
      const module = context.server.moduleGraph.getModuleById(resolvedVirtualId);
      if (module) {
        context.server.moduleGraph.invalidateModule(module);
        return [module];
      }
    },
    generateBundle: {
      order: "post", // 等待入口脚本与样式路径写入通用网页。
      handler(_options, bundle) {
        const entry = bundle["index.html"];
        if (!entry || entry.type !== "asset") throw new Error("缺少静态网页生成入口");
        const template = String(entry.source);
        for (const site of SITE_CONFIGS) {
          const page = resolvePageSeo(site.route, language, entryRoute, counts, origin);
          const html = replaceSeoHead(template, page)
            // 仅移除旧正文兜底，保留页头的无脚本样式表。
            .replace(/(<body\b[^>]*>[\s\S]*?)<noscript>[\s\S]*?<\/noscript>/i, "$1");
          this.emitFile({ type: "asset", fileName: `${site.route.slice(1)}/index.html`, source: html });
        }
        // 后续构建步骤读取清单，实际运行原页面后保存正文，不再拼接额外介绍。
        this.emitFile({
          type: "asset", // 预渲染清单产物类型。
          fileName: "seo-prerender.json", // 构建后预渲染入口清单。
          source: JSON.stringify({
            base, // 静态资源与客户端路由的部署前缀。
            language, // 构建时使用的界面语言。
            routes: historyMode ? SITE_CONFIGS.filter((site) => site.prerender && !site.noindex).map((site) => site.route) : [], // 仅预渲染公开的历史路由页面。
          }),
        });
        // 不存在的范本使用独立错误网页，服务器以不存在状态返回，不回退到首页。
        this.emitFile({
          type: "asset", // 错误网页产物类型。
          fileName: "404.html", // 服务器错误页文件。
          source: '<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>页面不存在 - 轻舟简历</title></head><body><main><h1>页面不存在</h1><p>该地址没有对应的公开页面。</p><a href="/resume/template">浏览简历模板与范本</a></main></body></html>', // 可直接阅读的错误提示与返回入口。
        });
      },
    },
  };
}
