import { nextTick } from "vue";
import { getExportFileName, resumeTitle } from "../../resumeName";
import { useResumeStore } from "@/stores";
import { RESUME_WIDTH } from "../constants";

type ResumeRootRef = { value: HTMLElement | null };

const getResumePages = (rootRef: ResumeRootRef) => {
  const root = rootRef.value;
  if (!root) return [];
  return root.matches(".resume-page-item")
    ? [root]
    : Array.from(root.querySelectorAll<HTMLElement>(".resume-page-item"));
};

// 将资源转换为 data URL，保证导出的 HTML 离线打开时仍能显示
const toDataUrl = async (url: string, baseUrl: string, signal: AbortSignal) => {
  if (!url || url.startsWith("data:") || url.startsWith("#")) return url;
  try {
    const response = await fetch(new URL(url, baseUrl).href, { signal });
    if (!response.ok) return url;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
};

// 内嵌页面样式及其引用的字体、背景资源
const getEmbeddedStyles = async (signal: AbortSignal) => {
  const styleTexts = Array.from(document.styleSheets).flatMap((styleSheet) => {
    try {
      return Array.from(styleSheet.cssRules).map((rule) => rule.cssText);
    } catch {
      return [];
    }
  });
  const styleText = styleTexts.join("\n");
  const resourceUrls = [...styleText.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)]
    .map((match) => match[2])
    .filter((url): url is string => Boolean(url));
  const replacements = await Promise.all(
    resourceUrls.map(async (url) => [url, await toDataUrl(url, document.baseURI, signal)] as const),
  );
  const replacementMap = new Map(replacements);
  return styleText.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (match, quote, url) => {
    const target = replacementMap.get(url);
    return target ? `url(${quote}${target}${quote})` : match;
  });
};

// 将页面中的图片内嵌，避免导出文件依赖原站点地址
const inlineImages = async (root: HTMLElement, signal: AbortSignal) => {
  await Promise.all(
    Array.from(root.querySelectorAll<HTMLImageElement>("img")).map(async (image) => {
      const source = image.getAttribute("src");
      if (!source) return;
      const dataUrl = await toDataUrl(source, document.baseURI, signal);
      image.setAttribute("src", dataUrl);
      image.removeAttribute("srcset");
    }),
  );
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// 导出可直接打开并编辑的单文件 HTML
export const exportHtml = async (rootRef: ResumeRootRef, onSuccess?: () => void) => {
  const resumeStore = useResumeStore();
  const signal = resumeStore.beginPrinting();
  if (!signal) return;

  try {
    await nextTick();
    await document.fonts?.ready;
    if (signal.aborted) return;

    const pages = getResumePages(rootRef);
    if (!pages.length) {
      console.error("未找到可导出的简历页面");
      return;
    }

    const clones = pages.map((page) => {
      const clone = page.cloneNode(true) as HTMLElement;
      clone.style.boxShadow = "none";
      clone.style.borderRadius = "0";
      clone.style.border = "none";
      clone.style.margin = "0";
      clone.style.transform = "none";
      clone.style.zoom = "1";
      clone.setAttribute("contenteditable", "true");
      clone.setAttribute("spellcheck", "false");
      clone.querySelectorAll<HTMLElement>(".resume-module-wrapper").forEach((module) => {
        module.classList.remove("outline-2", "outline-offset-3", "outline-dashed", "outline-sf-theme");
        module.querySelectorAll(":scope > .absolute").forEach((action) => action.remove());
      });
      return clone;
    });

    const exportRoot = document.createElement("div");
    exportRoot.append(...clones);
    await inlineImages(exportRoot, signal);
    if (signal.aborted) return;

    const styles = await getEmbeddedStyles(signal);
    if (signal.aborted) return;
    const pageMarkup = clones.map((page) => page.outerHTML).join("\n");
    const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(resumeTitle.value)}</title>
  <style>
${styles}
    html, body { margin: 0; padding: 0; background: #f3f4f6; }
    body { min-width: ${RESUME_WIDTH}px; }
    .resume-html-export { display: flex; flex-direction: column; align-items: center; gap: 24px; padding: 24px 0; }
    .resume-html-export .resume-page-item { flex: none; box-shadow: 0 2px 12px rgb(0 0 0 / 0.12); }
    .resume-html-export [contenteditable="true"] { outline: none; }
    @media print {
      @page { size: A4; margin: 0; }
      html, body { background: #fff; }
      .resume-html-export { gap: 0; padding: 0; }
      .resume-html-export .resume-page-item { box-shadow: none; page-break-after: always; break-after: page; }
      .resume-html-export .resume-page-item:last-child { page-break-after: auto; break-after: auto; }
    }
  </style>
</head>
<body>
  <main class="resume-html-export">
${pageMarkup}
  </main>
</body>
</html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getExportFileName(resumeTitle.value, "html");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    onSuccess?.();
  } catch (error) {
    console.error("生成 HTML 失败:", error);
  } finally {
    resumeStore.finishPrinting(signal);
  }
};
