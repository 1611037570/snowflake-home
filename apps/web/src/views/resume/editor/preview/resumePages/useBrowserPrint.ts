import { nextTick } from "vue";
import { useResumeStore } from "@/stores";
import { getExportFileName, resumeTitle } from "../../resumeName";

type ResumeRootRef = { value: HTMLElement | null };

const getResumeRoot = (rootRef: ResumeRootRef) => rootRef.value;

// 复制当前页面样式，保持模板和主题在打印文档中继续生效。
const getStyleText = () =>
  Array.from(document.styleSheets)
    .flatMap((styleSheet) => {
      try {
        return Array.from(styleSheet.cssRules).map((rule) => rule.cssText);
      } catch {
        return [];
      }
    })
    .join("\n");

// 等待打印文档中的图片加载完成，Base64 图片保持原有地址不做转换。
const waitForImages = async (printDocument: Document) => {
  await Promise.all(
    Array.from(printDocument.images).map(async (image) => {
      if (image.complete) return;
      await new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  );
};

// 等待字体、图片和两帧布局完成后再调用浏览器打印。
const waitForPrintReady = async (printWindow: Window, printDocument: Document) => {
  await printDocument.fonts?.ready;
  await waitForImages(printDocument);
  await new Promise<void>((resolve) => {
    printWindow.requestAnimationFrame(() => {
      printWindow.requestAnimationFrame(() => resolve());
    });
  });
};

// 使用隐藏 iframe 复制当前简历 DOM，交给浏览器原生打印。
export const printResume = async (
  rootRef: ResumeRootRef,
  onSuccess?: () => void,
  scale = 1,
) => {
  void scale;
  const resumeStore = useResumeStore();
  const signal = resumeStore.beginPrinting();
  if (!signal) return;

  const root = getResumeRoot(rootRef);
  if (!root) {
    resumeStore.finishPrinting(signal);
    console.error("未找到可打印的简历页面");
    return;
  }

  const printFrame = document.createElement("iframe");
  printFrame.setAttribute("title", "简历打印预览");
  printFrame.style.position = "absolute";
  printFrame.style.width = "1px";
  printFrame.style.height = "1px";
  printFrame.style.left = "-9999px";
  printFrame.style.visibility = "hidden";

  // iframe 打印时浏览器取顶层 document.title 作为默认文件名，打印结束后还原
  const originalTitle = document.title;
  let restored = false;
  const restorePrintState = (success = false) => {
    if (restored) return;
    restored = true;
    document.title = originalTitle;
    printFrame.remove();
    resumeStore.finishPrinting(signal);
    if (success) onSuccess?.();
  };

  signal.addEventListener(
    "abort",
    () => restorePrintState(),
    { once: true },
  );

  try {
    const clonedRoot = root.cloneNode(true) as HTMLElement;
    clonedRoot.style.transform = "none";
    clonedRoot.style.zoom = "1";
    clonedRoot.classList.add("resume-iframe-print-root");

    const styleText = getStyleText();
    const baseHref = document.baseURI.replace(/"/g, "&quot;");
    document.body.appendChild(printFrame);
    const printDocument = printFrame.contentDocument;
    const printWindow = printFrame.contentWindow;
    if (!printDocument || !printWindow) {
      restorePrintState();
      console.error("创建浏览器打印文档失败");
      return;
    }

    printDocument.open();
    printDocument.write(`
      <!doctype html>
      <html lang="zh-CN" class="${document.documentElement.className}">
        <head>
          <meta charset="UTF-8" />
          <base href="${baseHref}" />
          <title>${document.title}</title>
          <style>${styleText}</style>
          <style>
            @page { size: A4; margin: 0; }
            html, body { margin: 0; padding: 0; background: #fff; }
            body { width: 210mm; min-width: 794px; }
            /* 强制打印背景色，否则浏览器默认丢弃背景导致主题色丢失 */
            html, body, .resume-iframe-print-root, .resume-iframe-print-root * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .resume-iframe-print-root { width: 794px !important; gap: 0 !important; }
            .resume-iframe-print-root .resume-page-item {
              margin: 0 !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              transform: none !important;
              zoom: 1 !important;
              break-after: page;
              page-break-after: always;
            }
            .resume-iframe-print-root .resume-page-item:last-child {
              break-after: auto;
              page-break-after: auto;
            }
          </style>
        </head>
        <body>
          <main id="print-content"></main>
        </body>
      </html>
    `);
    printDocument.close();
    printDocument.body.className = document.body.className;

    const printContent = printDocument.getElementById("print-content");
    if (!printContent) {
      restorePrintState();
      console.error("创建浏览器打印内容失败");
      return;
    }
    printContent.appendChild(clonedRoot);

    await nextTick();
    if (signal.aborted) return;
    await waitForPrintReady(printWindow, printDocument);
    if (signal.aborted) return;

    printWindow.onafterprint = () => restorePrintState(true);
    // 仅在此刻改标题，避免简历标题中的特殊字符写入打印文档
    document.title = getExportFileName(resumeTitle.value, "pdf");
    printWindow.focus();
    printWindow.print();
  } catch (error) {
    restorePrintState();
    console.error("创建 iframe 浏览器打印失败:", error);
  }
};
