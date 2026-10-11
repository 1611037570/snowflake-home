import type { Plugin, ViteDevServer } from "vite";
import { SITE_CONFIGS } from "../site.config";

/** 去掉结尾斜杠，避免与路由路径拼出双斜杠。 */
const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

/**
 * 站点地图与 robots 生成插件
 * 路由清单只在 site.config.ts 维护一份，sitemap 收录与 Disallow 都由它派生，
 * 避免新增页面时漏改其中一处，造成页面不被收录或私有页被收录。
 */
export function seoFilesPlugin(siteUrl: string): Plugin {
  const origin = trimTrailingSlash(siteUrl);
  const indexable = SITE_CONFIGS.filter((item) => !item.noindex);
  const blocked = SITE_CONFIGS.filter((item) => item.noindex);

  const urlEntries = indexable
    .map((item) => {
      const lines = [`    <loc>${origin}${item.route}</loc>`];
      if (item.changefreq) lines.push(`    <changefreq>${item.changefreq}</changefreq>`);
      if (item.priority !== undefined) lines.push(`    <priority>${item.priority.toFixed(1)}</priority>`);
      return `  <url>\n${lines.join("\n")}\n  </url>`;
    })
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!-- 由构建期依据 site.config.ts 生成，请勿手工编辑 -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

  const disallow = blocked.map((item) => `Disallow: ${item.route}`).join("\n");
  const robots = `User-agent: *
Allow: /
${blocked.length ? `\n# 工具页与用户私有页不参与收录，与页面内输出的 noindex 指令同源\n${disallow}\n` : ""}
Sitemap: ${origin}/sitemap.xml
`;

  const files: Record<string, { source: string; contentType: string }> = {
    "/sitemap.xml": { source: sitemap, contentType: "application/xml; charset=utf-8" },
    "/robots.txt": { source: robots, contentType: "text/plain; charset=utf-8" },
  };

  return {
    name: "seo-files",
    // 站点地址缺失时只能拼出相对路径，sitemap 与 og 会失效，这里显式告警而不是静默产出坏文件
    buildStart() {
      if (!origin) this.warn("未配置 VITE_SITE_URL，sitemap 与 og 卡片将缺少域名前缀");
    },
    // 写入产物目录，与 index.html 一起部署
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });
    },
    // 开发环境没有产物阶段，用中间件直接提供，便于本地核对生成结果
    configureServer(server: ViteDevServer) {
      server.middlewares.use((request, response, next) => {
        const path = request.url?.split("?")[0] ?? "";
        const file = files[path];
        if (!file) {
          next();
          return;
        }
        response.setHeader("Content-Type", file.contentType);
        response.end(file.source);
      });
    },
  };
}
