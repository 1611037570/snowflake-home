import { nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { RESUME_HEIGHT, RESUME_WIDTH } from "../constants";
import type { Ref } from "vue";

type ResumeRootRef = Ref<HTMLElement | null>;

// 获取当前预览中的简历页面
const getResumePages = (rootRef: ResumeRootRef) => {
  const root = rootRef.value;
  if (!root) return [];
  return root.matches(".resume-page-item")
    ? [root]
    : Array.from(root.querySelectorAll<HTMLElement>(".resume-page-item"));
};

// 复制打印页面并移除编辑态样式，避免选中边框进入打印内容
const clonePrintPage = (page: HTMLElement) => {
  const clone = page.cloneNode(true) as HTMLElement;
  clone.style.boxShadow = "none";
  clone.style.borderRadius = "0";
  clone.style.border = "none";
  clone.style.margin = "0";
  clone.style.transform = "none";
  clone.style.zoom = "1";
  clone.querySelectorAll<HTMLElement>(".resume-module-wrapper").forEach((module) => {
    module.classList.remove("outline-2", "outline-offset-3", "outline-dashed", "outline-sf-theme");
  });
  return clone;
};

// 将预览页面按指定倍率渲染为图片，供当前页面系统打印
const getPrintImageHtml = async (pages: HTMLElement[], scale: number) => {
  const { snapdom } = await import("@zumer/snapdom");
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.top = "-9999px";
  tempContainer.style.left = "-9999px";
  tempContainer.style.width = `${RESUME_WIDTH}px`;
  document.body.appendChild(tempContainer);

  try {
    const images = [];
    for (const page of pages) {
      const clone = clonePrintPage(page);
      tempContainer.innerHTML = "";
      tempContainer.appendChild(clone);
      const canvas = await snapdom.toCanvas(clone, {
        scale,
        backgroundColor: "#ffffff",
        embedFonts: true,
        width: RESUME_WIDTH,
        height: RESUME_HEIGHT,
      });
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("简历页面渲染失败");
      }
      images.push(
        `<img src="${canvas.toDataURL("image/png")}" width="${RESUME_WIDTH}" height="${RESUME_HEIGHT}" alt="">`,
      );
    }

    return images.join("");
  } finally {
    tempContainer.remove();
  }
};

// 使用当前页面的浏览器系统打印，不修改原页面选中状态
export const printResume = async (
  rootRef: ResumeRootRef,
  onSuccess?: () => void,
  scale = 1,
) => {
  const resumeStore = useResumeStore();
  const { isPrinting } = storeToRefs(resumeStore);
  if (isPrinting.value) return;

  const pages = getResumePages(rootRef);
  if (!pages.length) {
    console.error("未找到可打印的简历页面");
    return;
  }

  isPrinting.value = true;
  let printRoot: HTMLDivElement | undefined;
  let printStyle: HTMLStyleElement | undefined;
  const previousAfterPrint = window.onafterprint;
  let restored = false;
  const restorePrintState = (success = false) => {
    if (restored) return;
    restored = true;
    printRoot?.remove();
    printStyle?.remove();
    window.onafterprint = previousAfterPrint;
    isPrinting.value = false;
    if (success) onSuccess?.();
    previousAfterPrint?.call(window);
  };

  try {
    await nextTick();
    await document.fonts?.ready;
    const imageMarkup = await getPrintImageHtml(pages, scale);
    printRoot = document.createElement("div");
    printRoot.className = "resume-browser-print-root";
    printRoot.innerHTML = imageMarkup;
    printStyle = document.createElement("style");
    printStyle.textContent = `
      @media screen {
        .resume-browser-print-root { display: none; }
      }
      @media print {
        @page { size: A4; margin: 0; }
        html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
        body > *:not(.resume-browser-print-root) { display: none !important; }
        .resume-browser-print-root { display: block !important; }
        .resume-browser-print-root img {
          display: block;
          width: ${RESUME_WIDTH}px;
          height: ${RESUME_HEIGHT}px;
          page-break-after: always;
          break-after: page;
        }
        .resume-browser-print-root img:last-child {
          page-break-after: auto;
          break-after: auto;
        }
      }
    `;
    document.head.appendChild(printStyle);
    document.body.appendChild(printRoot);
    // 等待打印图片完成解码，避免系统打印预览捕获到空白页面
    await Promise.all(
      Array.from(printRoot.querySelectorAll<HTMLImageElement>("img")).map((image) => {
        if (image.complete) return image.decode?.().catch(() => undefined);
        return new Promise<void>((resolve) => {
          image.onload = () => resolve();
          image.onerror = () => resolve();
        });
      }),
    );
    window.onafterprint = () => {
      restorePrintState(true);
    };
    window.print();
  } catch (error) {
    restorePrintState();
    console.error("打开浏览器打印失败:", error);
  }
};
