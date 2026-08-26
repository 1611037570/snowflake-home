/**
 * useImageExport —— 简历完整内容导出图片的 composable
 *
 * 作用：将传入的完整简历 DOM 渲染为一张 PNG 图片并下载。
 */
import { nextTick } from "vue";
import { storeToRefs } from "pinia";
import { resumeTitle } from "../utils";
import { useResumeStore } from "@/stores";

type ImageExportRoot = HTMLElement | { value: unknown };

const isHTMLElement = (value: unknown): value is HTMLElement =>
  typeof HTMLElement !== "undefined" && value instanceof HTMLElement;

// 兼容原生元素 ref 与 Vue 组件 ref，统一获取真实 DOM 根节点
const getRootElement = (rootRef?: ImageExportRoot): HTMLElement | null => {
  if (!rootRef) return null;

  const value = isHTMLElement(rootRef)
    ? rootRef
    : rootRef.value && typeof rootRef.value === "object" && "$el" in rootRef.value
      ? (rootRef.value as { $el?: unknown }).$el
      : rootRef.value;

  return isHTMLElement(value) ? value : null;
};

/**
 * 创建简历图片导出能力
 * @param rootRef 需要导出的完整简历 DOM ref，例如 MeasureContent 的 ref
 * @returns 导出 PNG 图片的方法
 */
export const useImageExport = (rootRef?: ImageExportRoot) => {
  /**
   * 将完整简历内容渲染为一张 PNG 图片
   */
  const printImage = async () => {
    const resumeStore = useResumeStore();
    const { selectedModule, isPrinting } = storeToRefs(resumeStore);
    if (isPrinting.value) return;

    // 导出期间锁定编辑器并移除模块选中状态
    isPrinting.value = true;
    const cachedSelectedModule = [...selectedModule.value];
    selectedModule.value.splice(0);
    let tempContainer: HTMLDivElement | undefined;

    try {
      await nextTick();
      await document.fonts?.ready;

      const rootEl = getRootElement(rootRef);
      if (!rootEl) {
        console.error("未找到可导出的简历 DOM");
        return;
      }

      const { snapdom } = await import("@zumer/snapdom");
      const clone = rootEl.cloneNode(true) as HTMLDivElement;
      const rootWidth = rootEl.getBoundingClientRect().width;

      // 克隆到文档外渲染，解除测量容器的隐藏样式
      clone.style.position = "absolute";
      clone.style.top = "-9999px";
      clone.style.left = "-9999px";
      clone.style.opacity = "1";
      clone.style.zIndex = "0";
      clone.style.transform = "none";
      clone.style.zoom = "1";
      clone.style.margin = "0";
      if (rootWidth > 0) clone.style.width = `${rootWidth}px`;

      tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.top = "-9999px";
      tempContainer.style.left = "-9999px";
      if (rootWidth > 0) tempContainer.style.width = `${rootWidth}px`;
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      const canvas = await snapdom.toCanvas(clone, {
        scale: 2,
        backgroundColor: "#ffffff",
        embedFonts: true,
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        console.error("简历图片渲染失败");
        return;
      }

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });
      if (!blob) {
        console.error("简历图片生成失败");
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resumeTitle.value}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("生成简历图片失败:", error);
    } finally {
      if (tempContainer?.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
      selectedModule.value.splice(0, selectedModule.value.length, ...cachedSelectedModule);
      isPrinting.value = false;
    }
  };

  return { printImage };
};
