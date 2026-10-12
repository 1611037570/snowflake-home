import { ElMessage } from "element-plus";
import { collectResumeStyles } from "./exportStyles";
import { nextTick } from "vue";
import { useResumeName } from "../../../../hooks/useResumeName";
import { useResumeStore } from "@/stores";
import { RESUME_WIDTH } from "../../shared/constants";
import { stripEditorPageFrame } from "./pageFrame";

type ResumeRootRef = { value: HTMLElement | null };

const getResumePages = (rootRef: ResumeRootRef) => {
  const root = rootRef.value;
  if (!root) return [];
  return root.matches(".resume-page-item")
    ? [root]
    : Array.from(root.querySelectorAll<HTMLElement>(".resume-page-item"));
};

// 一次导出内按绝对地址复用资源请求，取消与失败向调用方报告。
const createResourceResolver = (signal: AbortSignal) => {
  const tasks = new Map<string, Promise<string>>(); // 每个资源地址对应唯一读取任务
  return (url: string): Promise<string> => {
    if (!url || url.startsWith("data:") || url.startsWith("#")) return Promise.resolve(url);
    const absolute = new URL(url, document.baseURI).href;
    let task = tasks.get(absolute);
    if (!task) {
      task = fetch(absolute, { signal }).then(async (response) => {
        if (!response.ok) throw new Error("简历导出资源读取失败");
        const blob = await response.blob();
        signal.throwIfAborted();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          const abort = () => { reader.abort(); reject(signal.reason); };
          const cleanup = () => signal.removeEventListener("abort", abort);
          reader.onload = () => { cleanup(); resolve(String(reader.result)); };
          reader.onerror = () => { cleanup(); reject(reader.error); };
          reader.onabort = cleanup;
          signal.addEventListener("abort", abort, { once: true });
          reader.readAsDataURL(blob);
          if (signal.aborted) abort();
        });
      });
      tasks.set(absolute, task);
    }
    return task;
  };
};

// 仅内嵌简历实际使用的样式及去重后的资源，资源缺失时不宣称离线完成。
const getEmbeddedStyles = async (styleText: string, resolveResource: (url: string) => Promise<string>) => {
  const resourceUrls = new Set([...styleText.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)]
    .map((match) => match[2]).filter((url): url is string => Boolean(url)));
  const replacements = await Promise.all(
    [...resourceUrls].map(async (url) => [url, await resolveResource(url)] as const),
  );
  const replacementMap = new Map(replacements);
  return styleText.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (match, quote, url) => {
    const target = replacementMap.get(url);
    return target ? `url(${quote}${target}${quote})` : match;
  });
};

// 图片与样式资源共用读取缓存，同图跨页只读取一次。
const inlineImages = async (root: HTMLElement, resolveResource: (url: string) => Promise<string>) => {
  await Promise.all(Array.from(root.querySelectorAll<HTMLImageElement>("img")).map(async (image) => {
    const source = image.getAttribute("src");
    if (!source) return;
    image.setAttribute("src", await resolveResource(source));
    image.removeAttribute("srcset");
  }));
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// 导出可直接打开并编辑的单文件 HTML
export const exportHtml = async (rootRef: ResumeRootRef, onSuccess?: () => void) => {
  const resumeStore = useResumeStore();
  const { getExportFileName, resumeTitle } = useResumeName();
  const signal = resumeStore.beginPrinting();
  if (!signal) return;
  // 记录导出所属简历，避免旧导出任务下载新简历内容
  const resumeId = resumeStore.currentItem?.id;
  const isCurrentResume = () => resumeStore.currentItem?.id === resumeId;

  try {
    await nextTick();
    await document.fonts?.ready;
    if (signal.aborted || !isCurrentResume()) return;

    const pages = getResumePages(rootRef);
    if (!pages.length) {
      console.error("未找到可导出的简历页面");
      return;
    }

    const clones = pages.map((page) => {
      const clone = page.cloneNode(true) as HTMLElement;
      // 编辑器页边线属于预览装饰，导出前移除；纸张边框由主题声明，保持不动
      stripEditorPageFrame(clone);
      clone.style.boxShadow = "none";
      clone.style.margin = "0";
      clone.style.transform = "none";
      clone.style.zoom = "1";
      clone.setAttribute("contenteditable", "true");
      clone.setAttribute("spellcheck", "false");
      clone.querySelectorAll("[data-resume-editor-action]").forEach((action) => action.remove());
      return clone;
    });

    const exportRoot = document.createElement("div");
    exportRoot.append(...clones);
    const resolveResource = createResourceResolver(signal);
    const styleText = collectResumeStyles(exportRoot, rootRef.value!);
    await inlineImages(exportRoot, resolveResource);
    if (signal.aborted || !isCurrentResume()) return;

    const styles = await getEmbeddedStyles(styleText, resolveResource);
    if (signal.aborted || !isCurrentResume()) return;
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
    if (isCurrentResume()) onSuccess?.();
  } catch (error) {
    if (!signal.aborted && isCurrentResume()) {
      console.error("生成 HTML 失败:", error);
      ElMessage.error("网页导出失败，请检查字体或图片资源后重试");
    }
  } finally {
    resumeStore.finishPrinting(signal);
  }
};
