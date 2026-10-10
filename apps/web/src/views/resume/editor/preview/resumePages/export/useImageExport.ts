/**
 * imageExport —— 简历完整内容导出图片
 *
 * 作用：将传入的完整简历 DOM 渲染为一张 PNG 图片并下载。
 * 无组件级响应式状态，使用纯函数按需调用。
 */
import { nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useResumeName } from "../../../../hooks/useResumeName";
import { useResumeStore } from "@/stores";
import { resolveThemeDecisions } from "@/views/resume/theme";
import { stripEditorPageFrame } from "./pageFrame";
import { collectResumeStyles } from "./exportStyles";
import { waitForExportResources, waitForExportTask } from "./exportResources";
import { createLongImagePdfJob } from "./longImagePdf";

type ImageExportRoot = HTMLElement | { value: unknown };

/** 纸张外观：长图源（测量宿主）只复刻纸张底色，边框需要在克隆体上补画 */
interface PaperSurface {
  /** 纸张底色，同时作为画布背景色 */
  background: string;
  /** 纸张边框宽度，0 表示不描边 */
  borderWidth: number;
  /** 纸张边框颜色 */
  borderColor: string;
}

/** 按主题声明的纸张外观创建覆盖层：绝对定位不参与布局，不会改变已验证的排版结果 */
const createPaperFrame = ({ borderWidth, borderColor }: PaperSurface) => {
  const frame = document.createElement("div");
  frame.setAttribute("aria-hidden", "true");
  frame.style.position = "absolute";
  frame.style.inset = "0";
  frame.style.boxSizing = "border-box";
  frame.style.pointerEvents = "none";
  if (borderWidth > 0) frame.style.border = `${borderWidth}px solid ${borderColor}`;
  return frame;
};

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

// 断点探针只是测量脚手架：绝对定位且不可见，不参与导出画面，移除后能大幅减少渲染量
const MEASURE_PROBE_SELECTOR = ".layout-measure-breakpoint";

// 克隆时跳过整个探针子树，避免先复制大量重复正文再删除。
const cloneExportContent = (node: Node): Node => {
  const clone = node.cloneNode(false);
  for (const child of node.childNodes) {
    if (child instanceof Element && child.matches(MEASURE_PROBE_SELECTOR)) continue;
    clone.appendChild(cloneExportContent(child));
  }
  return clone;
};

// 将长图 DOM 渲染为画布，PNG 和长图 PDF 共用这份渲染结果。
const renderLongImage = async (
  rootRef: ImageExportRoot | undefined,
  signal: AbortSignal,
  scale: number,
  isCurrentResume: () => boolean,
  paper: PaperSurface,
) => {
  await nextTick();
  let rootEl = getRootElement(rootRef);
  if (!rootEl) throw new Error("未找到可导出的简历 DOM");
  // 仅等待当前简历的资源，图标完成后重新读取可能被测量更新的宿主。
  const [{ snapdom }] = await waitForExportTask(Promise.all([
    import("@zumer/snapdom"),
    waitForExportResources(rootEl, signal),
  ]), signal);
  if (signal.aborted || !isCurrentResume()) return null;
  rootEl = getRootElement(rootRef);
  if (!rootEl) throw new Error("未找到可导出的简历 DOM");

  const clone = cloneExportContent(rootEl) as HTMLDivElement;
  // 预览区使用 transform: scale()，导出要取未缩放的布局宽度。
  const rootWidth = rootEl.offsetWidth;

  // 克隆到文档外渲染，解除测量容器的隐藏样式
  clone.style.position = "absolute";
  clone.style.top = "-9999px";
  clone.style.left = "-9999px";
  clone.style.opacity = "1";
  clone.style.zIndex = "0";
  clone.style.transform = "none";
  clone.style.zoom = "1";
  clone.style.margin = "0";
  // 测量宿主用 visibility: hidden 隐藏，克隆必须显式恢复可见，否则导出只有背景色
  clone.style.visibility = "visible";
  clone.style.pointerEvents = "auto";
  // 编辑器页边线属于预览装饰，导出前移除；纸张边框是主题外观，改用覆盖层补画
  stripEditorPageFrame(clone);
  // 长图源只有纸张底色，补画真实纸张外观；覆盖层不占布局，排版结果与页面完全一致
  if (paper.borderWidth > 0) clone.appendChild(createPaperFrame(paper));
  if (rootWidth > 0) clone.style.width = `${rootWidth}px`;

  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.top = "-9999px";
  tempContainer.style.left = "-9999px";
  if (rootWidth > 0) tempContainer.style.width = `${rootWidth}px`;
  tempContainer.appendChild(clone);
  document.body.appendChild(tempContainer);
  const exportFrame = document.createElement("iframe");
  // 保留当前视口尺寸，避免隔离文档的媒体查询改变主题排版。
  exportFrame.style.cssText = `position:absolute;left:-9999px;top:-9999px;width:${window.innerWidth}px;height:${window.innerHeight}px;border:0;pointer-events:none;`;
  exportFrame.setAttribute("aria-hidden", "true");

  try {
    // 单行字段在导出字体回退时保持单行，多行字段继续使用原有换行规则。
    // 先批量读取行数再修改样式，避免每个字段都触发一次重新布局。
    const singleLineFields = Array.from(clone.querySelectorAll<HTMLElement>("[data-resume-plain-text]")).filter((field) => {
      const range = document.createRange();
      range.selectNodeContents(field);
      const lines = Array.from(range.getClientRects()).filter((rect) => rect.width > 0 && rect.height > 0);
      return lines.length === 1;
    });
    singleLineFields.forEach((field) => { field.style.whiteSpace = "nowrap"; });
    // 只复制简历依赖的样式，避免渲染库逐节点扫描整份编辑器文档。
    const styleText = collectResumeStyles(clone, clone);
    document.body.appendChild(exportFrame);
    const exportDocument = exportFrame.contentDocument;
    if (!exportDocument) throw new Error("创建简历导出文档失败");
    exportDocument.documentElement.className = document.documentElement.className;
    exportDocument.documentElement.style.cssText = document.documentElement.style.cssText;
    exportDocument.body.className = document.body.className;
    exportDocument.body.style.cssText = document.body.style.cssText;
    const base = exportDocument.createElement("base");
    base.href = document.baseURI;
    const style = exportDocument.createElement("style");
    style.textContent = styleText;
    exportDocument.head.append(base, style);
    exportDocument.body.appendChild(clone);
    // 新文档先完成布局以触发所需字体加载，再读取稳定的字体尺寸。
    void clone.offsetHeight;
    await waitForExportResources(clone, signal);
    if (signal.aborted || !isCurrentResume()) return null;
    const canvas = await snapdom.toCanvas(clone, {
      scale,
      backgroundColor: paper.background,
      embedFonts: true,
      // 按真实 DOM 校正导出布局，避免文本重新排版后提前换行。
      reconcile: true,
    });
    if (signal.aborted || !isCurrentResume()) return null;
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error("简历图片渲染失败");
    }
    return canvas;
  } finally {
    exportFrame.remove();
    if (tempContainer.parentNode) tempContainer.parentNode.removeChild(tempContainer);
  }
};

// 按指定格式导出长图，避免 PNG 与 PDF 重复实现 DOM 渲染流程。
const exportLongImage = async (
  rootRef?: ImageExportRoot,
  onSuccess?: () => void,
  scale = 2,
  format: "png" | "pdf" = "png",
) => {
  const resumeStore = useResumeStore();
  const { getExportFileName, resumeTitle } = useResumeName();
  const { selectedModule, currentUI } = storeToRefs(resumeStore);
  const signal = resumeStore.beginPrinting();
  if (!signal) return;
  // 记录导出所属简历，避免旧导出任务写入新简历
  const resumeId = resumeStore.currentItem?.id;
  const isCurrentResume = () => resumeStore.currentItem?.id === resumeId;

  // 导出期间锁定编辑器并移除模块选中状态
  const cachedSelectedModule = [...selectedModule.value];
  resumeStore.clearSelectedModules();
  let pdfJob: ReturnType<typeof createLongImagePdfJob> | null = null; // 仅所选格式需要时创建后台任务

  try {
    // 纸张底色来自简历 ui，边框按主题编号解析，外轮廓统一使用直角。
    const page = currentUI.value?.page || {};
    const { pageBorder } = resolveThemeDecisions(currentUI.value?.theme?.template);
    const paper: PaperSurface = {
      background: page.background || "#ffffff",
      borderWidth: pageBorder.width,
      borderColor: pageBorder.color,
    };
    // 后台资源加载与画布生成并行，封装计算不占用编辑器主线程。
    if (format === "pdf") pdfJob = createLongImagePdfJob(signal);
    const canvas = await renderLongImage(rootRef, signal, scale, isCurrentResume, paper);
    if (signal.aborted || !isCurrentResume()) return;

    if (!canvas) return;

    // 两种格式共用异步图片编码，避免长图转为大体积字符串阻塞界面。
    let blob = await waitForExportTask(new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png");
    }), signal);
    if (signal.aborted || !isCurrentResume()) return;
    if (!blob) throw new Error("简历图片生成失败");

    if (format === "pdf") {
      // 转移二进制数据，后台返回文件后由主线程统一下载。
      const imageBytes = await waitForExportTask(blob.arrayBuffer(), signal);
      if (signal.aborted || !isCurrentResume()) return;
      pdfJob!.write(imageBytes, canvas.width, canvas.height);
      blob = await pdfJob!.result;
      if (signal.aborted || !isCurrentResume()) return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // 两种长图格式统一下载，保持原有命名规则。
    link.download = getExportFileName(resumeTitle.value, format);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    if (isCurrentResume()) onSuccess?.();
  } catch (error) {
    if (!signal.aborted) console.error(format === "pdf" ? "生成长图PDF失败:" : "生成简历图片失败:", error);
  } finally {
    pdfJob?.dispose();
    if (isCurrentResume()) resumeStore.setSelectedModules(cachedSelectedModule);
    resumeStore.finishPrinting(signal);
  }
};

/**
 * 将完整简历内容渲染为一张 PNG 图片并下载
 * @param rootRef 需要导出的完整简历 DOM ref，例如 MeasureContent 的 ref
 */
export const printImage = (
  rootRef?: ImageExportRoot,
  onSuccess?: () => void,
  scale = 2,
) => exportLongImage(rootRef, onSuccess, scale, "png");

// 将同一份长图画布封装为单页长尺寸 PDF 并下载。
export const printLongImagePdf = (
  rootRef?: ImageExportRoot,
  onSuccess?: () => void,
  scale = 2,
) => exportLongImage(rootRef, onSuccess, scale, "pdf");
