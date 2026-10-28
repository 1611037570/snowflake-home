/** 构建后预渲染原有公开界面，不增加额外说明，也不访问真实用户数据。 */
import { createServer } from "node:http";
import { readFile, writeFile, stat } from "node:fs/promises";
import { resolve, relative, isAbsolute, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync, brotliCompressSync } from "node:zlib";
import { chromium } from "playwright";

const output = fileURLToPath(new URL("../../../dist/web/", import.meta.url));
const manifest = JSON.parse(await readFile(resolve(output, "seo-prerender.json"), "utf8"));
if (!manifest.routes.length) {
  console.log("[预渲染] 当前构建没有公开历史路由，跳过。");
  process.exit(0);
}

// 保存原始网页后再开始渲染，保证本次保存的页面不作为后续页面的输入。
const templates = new Map(await Promise.all(manifest.routes.map(async (route) => [
  route,
  await readFile(resolve(output, `.${route}/index.html`), "utf8"),
])));
const entry = await readFile(resolve(output, "index.html"));
const base = new URL(manifest.base, "http://localhost").pathname.replace(/\/+$/, "");
let browser;

// 仅向本机提供本次构建产物，路径限制在产物目录，缺失业务地址回退到应用入口。
const server = createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (base && (pathname === base || pathname.startsWith(`${base}/`))) pathname = pathname.slice(base.length) || "/";
    const route = pathname.replace(/\/+$/, "");
    const template = templates.get(route);
    if (template) {
      response.setHeader("Content-Type", "text/html; charset=utf-8");
      response.end(template);
      return;
    }
    let path = resolve(output, `.${pathname}`);
    const child = relative(output, path);
    if (child === ".." || child.startsWith(`..${sep}`) || isAbsolute(child)) {
      response.writeHead(403).end();
      return;
    }
    let info = await stat(path).catch(() => null);
    if (info?.isDirectory()) {
      path = resolve(path, "index.html");
      info = await stat(path).catch(() => null);
    }
    if (!info?.isFile()) {
      response.setHeader("Content-Type", "text/html; charset=utf-8");
      response.writeHead(extname(pathname) ? 404 : 200).end(extname(pathname) ? "" : entry);
      return;
    }
    switch (extname(path)) {
      case ".js": case ".mjs": response.setHeader("Content-Type", "text/javascript; charset=utf-8"); break;
      case ".css": response.setHeader("Content-Type", "text/css; charset=utf-8"); break;
      case ".json": response.setHeader("Content-Type", "application/json; charset=utf-8"); break;
      case ".svg": response.setHeader("Content-Type", "image/svg+xml"); break;
      case ".webp": response.setHeader("Content-Type", "image/webp"); break;
      case ".png": response.setHeader("Content-Type", "image/png"); break;
      case ".woff2": response.setHeader("Content-Type", "font/woff2"); break;
    }
    response.end(await readFile(path));
  } catch {
    response.writeHead(500).end();
  }
});

const escapeAttribute = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

try {
  await new Promise((ready, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", ready);
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    browser = await chromium.launch({
      headless: true, // 构建过程不打开可见浏览器窗口。
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined, // 可选复用构建机已安装的浏览器。
    });
  } catch (error) {
    throw new Error(`无法启动预渲染浏览器，请先执行 pnpm --filter @snowflake/web exec playwright install chromium。${error.message}`);
  }
  for (const route of manifest.routes) {
    // 每个页面使用全新上下文，不载入用户配置、目录授权、模型或投递记录。
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }, // 统一公开页面的初始布局尺寸。
      locale: manifest.language.startsWith("en") ? "en-US" : "zh-CN", // 与构建页面语言一致。
      colorScheme: "light", // 初始主题采用公开的亮色模式，运行时仍可正常切换。
      serviceWorkers: "block", // 避免离线缓存影响本次构建。
    });
    try {
      await context.addInitScript((language) => {
        localStorage.setItem("snowflakeLanguage", language.startsWith("en") ? "en" : "zh");
      }, manifest.language);
      // 只加载本次构建的本机资源，禁止访问模型、统计及其他外部服务。
      await context.route("**/*", (request) => {
        const url = new URL(request.request().url());
        const localAsset = url.origin === origin && !/^\/(?:api|llm)(?:\/|$)/.test(url.pathname.slice(base.length));
        return localAsset || url.protocol === "data:" || url.protocol === "blob:"
          ? request.continue()
          : request.abort();
      });
      const page = await context.newPage();
      await page.goto(`${origin}${base}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      // 等待真实路由、数据初始化和模板首批加载完成，不把加载骨架保存为正文。
      await page.waitForFunction((path) => {
        const layout = document.querySelector("[data-prerender-route]");
        return layout?.getAttribute("data-prerender-route") === path
          && document.querySelector("#app h1, #app h2")
          && !document.querySelector('#app [aria-busy="true"]');
      }, route, { timeout: 60000 });
      const snapshot = await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((ready) => requestAnimationFrame(() => requestAnimationFrame(ready)));
        await Promise.all(document.getAnimations().filter((animation) => {
          const end = animation.effect?.getComputedTiming().endTime;
          return typeof end === "number" && Number.isFinite(end) && end <= 5000;
        }).map((animation) => animation.finished.catch(() => {})));
        return {
          body: document.getElementById("app").innerHTML, // 原有组件实际渲染的页面内容。
          stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map((link) => link.href), // 当前路由按需加载的样式。
          styles: [...document.head.querySelectorAll("style")].map((style) => style.outerHTML), // 组件运行时注入的样式。
          theme: document.documentElement.className, // 页面正常初始化后的主题类名。
        };
      });
      const mount = /<div\s+id=(?:"app"|'app'|app)\s*><\/div>/i;
      let html = templates.get(route);
      if (!mount.test(html)) throw new Error(`预渲染入口缺失：${route}`);
      html = html.replace(mount, () => `<div id="app">${snapshot.body}</div>`);
      html = html.replace(/<html\b([^>]*)>/i, (_match, attributes) => `<html${attributes} class="${escapeAttribute(snapshot.theme)}">`);
      const stylesheets = snapshot.stylesheets.filter((href) => href.startsWith(origin)).map((href) => href.slice(origin.length));
      const styles = stylesheets.filter((href) => !html.includes(href)).map((href) => `<link rel="stylesheet" href="${escapeAttribute(href)}">`);
      html = html.replace(/<\/head>/i, () => `${styles.join("")}${snapshot.styles.filter((style) => !html.includes(style)).join("")}</head>`);
      const target = resolve(output, `.${route}/index.html`);
      await writeFile(target, html);
      // 已存在的压缩版本同步重写，避免服务器返回预渲染前的旧内容。
      for (const suffix of [".gz", ".br"]) {
        if (await stat(`${target}${suffix}`).catch(() => null)) {
          await writeFile(`${target}${suffix}`, suffix === ".gz" ? gzipSync(html) : brotliCompressSync(Buffer.from(html)));
        }
      }
      console.log(`[预渲染] 已保存原页面：${route}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser?.close();
  server.closeAllConnections();
  await new Promise((done) => server.close(done));
}
