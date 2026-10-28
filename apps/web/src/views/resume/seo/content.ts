import { publicExamples, type ExampleSection } from "./catalog";
import { resolveSiteConfig } from "../../../../site.config";
import { getInformationSections } from "./information";

// 所有来源文本统一转义，范本富文本只提取为段落，不执行其中的标签。
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => {
  switch (character) {
    case "&": return "&amp;";
    case "<": return "&lt;";
    case ">": return "&gt;";
    case '"': return "&quot;";
    default: return "&#39;";
  }
});

// 构建产物与浏览器可见正文共用渲染函数，避免维护爬虫专用内容。
export function renderPublicContent(path: string, sections: ExampleSection[] = [], english = false) {
  const kind = resolveSiteConfig(path)?.content;
  // 功能说明复用同一份可见段落，相关链接在不执行脚本时也能访问。
  if (kind && kind !== "catalog" && kind !== "example") {
    return `<section class="mx-auto max-w-7xl p-6 text-sf-text">
      ${getInformationSections(kind, english).map((section) => `<section class="mb-6">
        <h2 class="text-xl font-bold">${escapeHtml(section.title)}</h2>
        ${section.paragraphs.map((paragraph) => `<p class="mt-3 leading-7 text-sf-text-2">${escapeHtml(paragraph)}</p>`).join("")}
        ${section.links?.length ? `<nav class="mt-3 flex flex-wrap gap-6">${section.links.map((link) => `<a class="underline" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}</nav>` : ""}
      </section>`).join("")}
    </section>`;
  }
  const example = publicExamples.find((item) => item.path === path);
  if (example) {
    return `<article class="mx-auto max-w-5xl p-6 text-sf-text">
      <nav class="mb-6 flex flex-wrap gap-3" aria-label="${english ? "Breadcrumb" : "当前位置"}">
        <a href="/resume">${english ? "Home" : "轻舟简历"}</a>
        <a href="/resume/template">${english ? "Resume templates" : "简历模板与范本"}</a>
      </nav>
      <h1 class="text-3xl font-bold">${escapeHtml(example.name)}</h1>
      <p class="mt-3 text-sf-text-2">${escapeHtml(example.description)}</p>
      <p class="mt-3 text-sm text-sf-text-2">${english ? "Sample content for reference. Replace it with your own experience and results." : "以下为虚构简历范本内容，仅供写作参考；使用时请替换为自己的真实经历与成果。"}</p>
      ${sections.map((section) => `<section class="mt-6"><h2 class="text-xl font-bold">${escapeHtml(section.title)}</h2>${section.paragraphs.map((paragraph) => `<p class="mt-3 leading-7">${escapeHtml(paragraph)}</p>`).join("")}</section>`).join("")}
      <a class="mt-6 inline-block rounded-3xl border border-sf-b bg-sf-primary px-6 py-3 hover:bg-sf-bg" href="/resume/template?example=${encodeURIComponent(example.slug)}">${english ? "Use this example" : "使用这份范本"}</a>
    </article>`;
  }
  return `<section class="mx-auto max-w-7xl p-6 text-sf-text" aria-label="${english ? "Resume examples" : "岗位简历范本"}">
    <h2 class="text-2xl font-bold">${english ? "Resume examples by role and career stage" : "按岗位与求职阶段选择简历范本"}</h2>
    <p class="mt-3 leading-7 text-sf-text-2">${english ? "Choose an example, review its skills and experience, then edit online. No registration is required. Export as PDF, images or Markdown without a watermark." : "从校招、实习到社会招聘，先查看范本中的技能、工作经历和项目表达，再在线编辑为自己的简历。无需注册，支持导出无水印 PDF、图片和 Markdown。"}</p>
    <ul class="mt-6 grid gap-6 md:grid-cols-2">
      ${publicExamples.map((item) => `<li class="rounded-3xl border border-sf-b bg-sf-primary p-6 hover:bg-sf-bg"><a class="text-lg font-bold" href="${item.path}">${escapeHtml(item.name)}</a><p class="mt-3 text-sf-text-2">${escapeHtml(item.description)}</p></li>`).join("")}
    </ul>
    <a class="mt-6 inline-block underline" href="/resume/template">${english ? "Browse all templates and examples" : "浏览全部简历模板与范本"}</a>
  </section>`;
}

