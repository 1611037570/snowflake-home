import { publicExamples, type ExampleSection } from "./catalog";

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
  return "";
}
