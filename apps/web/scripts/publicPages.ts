import type { Plugin } from "vite";
import { SITE_CONFIGS, type CatalogCounts } from "../site.config";
import { publicExamples, type ExampleSection } from "../src/views/resume/seo/catalog";
import { escapeHtml, renderPublicContent } from "../src/views/resume/seo/content";
import { resolvePageSeo } from "../src/views/resume/seo/page";
import { replaceSeoHead } from "./seoHead";
import { getExampleSourceFiles, readExampleSections } from "./exampleSections";

const virtualId = "virtual:resume-public-sections";
const resolvedVirtualId = `\0${virtualId}`;

/** 为公开页面输出独立网页，并为浏览器提供相同的范本正文。 */
export function publicPagesPlugin(siteUrl: string, language: string, entryRoute: string, counts: CatalogCounts): Plugin {
  let root = "";
  let sections: Record<string, ExampleSection[]>;
  const origin = siteUrl.replace(/\/+$/, "");
  return {
    name: "resume-public-pages", // 静态正文与共享数据插件名称。
    enforce: "post", // 在通用入口网页生成后派生各路由网页。
    configResolved(config) {
      root = config.root;
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
          const { metadata } = page;
          const example = publicExamples.find((item) => item.path === site.route);
          let html = replaceSeoHead(template, page)
            // 仅移除旧正文兜底，保留页头的无脚本样式表。
            .replace(/(<body\b[^>]*>[\s\S]*?)<noscript>[\s\S]*?<\/noscript>/i, "$1");
          if (page.content) {
            html = html.replace(/<\/head>/i, '<style>.public-static{height:100svh;overflow:auto}</style></head>');
            const title = example ? "" : `<header class="mx-auto max-w-7xl p-6 text-sf-text"><h1 class="text-3xl font-bold">${escapeHtml(metadata.title)}</h1><p class="mt-3 leading-7">${escapeHtml(metadata.description)}</p></header>`;
            const content = `<main class="public-static bg-sf-page"><nav class="mx-auto flex max-w-7xl gap-6 p-6 text-sf-text"><a href="/resume">轻舟简历</a><a href="/resume/template">${language.startsWith("en") ? "Templates" : "简历模板"}</a></nav>${title}${renderPublicContent(site.route, example ? sections[example.slug] : [], language.startsWith("en"))}</main>`;
            const app = /<div\s+id=(?:"app"|'app'|app)\s*><\/div>/i;
            if (!app.test(html)) throw new Error("未找到静态正文挂载位置");
            html = html.replace(app, () => `<div id="app">${content}</div>`);
          }
          this.emitFile({ type: "asset", fileName: `${site.route.slice(1)}/index.html`, source: html });
        }
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
