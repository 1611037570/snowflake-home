/**
 * imageExport —— 简历完整内容导出图片
 *
 * 作用：将传入的完整简历 DOM 渲染为一张 PNG 图片并下载。
 * 无组件级响应式状态，使用纯函数按需调用。
 */
import { nextTick } from "vue";
import { storeToRefs } from "pinia";
import { getExportFileName, resumeTitle } from "../resumeName";
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
 * 将完整简历内容渲染为一张 PNG 图片并下载
 * @param rootRef 需要导出的完整简历 DOM ref，例如 MeasureContent 的 ref
 */
export const printImage = async (rootRef?: ImageExportRoot) => {
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
    // 单页模式测量源是可见页面（带编辑器边框/圆角），导出时清除，保证与多页导出表现一致
    clone.style.border = "none";
    clone.style.borderRadius = "0";
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
      // 像素级精确布局：避免字体回退栅格化导致文本重新换行而漏出内容
      reconcile: true,
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
    // 统一命名：年-月-日-简历标题
    link.download = getExportFileName(resumeTitle.value, "png");
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
