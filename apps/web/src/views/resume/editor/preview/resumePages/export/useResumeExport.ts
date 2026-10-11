/**
 * useResumeExport —— 简历导出功能
 *
 * 管理 PDF / 图片导出的全局事件注册与注销（仅编辑态注册，缩略图/全屏预览不注册），
 * 导出范围由本实例的根节点 ref 限定，避免误选其他 ResumePages 实例的页面。
 */
import { onMounted, onUnmounted, type ComputedRef, type Ref } from "vue";
import { ElMessage } from "element-plus";
import eventBus from "@/utils/modules/eventBus";
import { printResume } from "./useBrowserPrint";
import { printServerPDF as exportServerPdf } from "./useServerPdfExport";
import { printImage as exportImage, printLongImagePdf } from "./useImageExport";
import { exportMarkdown } from "./useMarkdownExport";
import { exportHtml } from "./useHtmlExport";
import type { PagePlan } from "../engine/paginate/pagePlan";
import { getExportLayoutStatus, type ExportLayoutMode } from "./exportLayout";
import { trackResumeAction } from "@/hooks";
import type { ResumeExportSource, ResumeFileType } from "@/apis";
/** useResumeExport 入参 */
interface UseResumeExportOptions {
  /** 编辑态才注册导出事件，其余模式（缩略图/全屏预览）不注册 */
  isEdit: ComputedRef<boolean>;
  /** 本实例分页根节点 ref：限定 PDF 导出范围 */
  rootRef: Ref<HTMLElement | null>;
  /** 测量容器 ref：图片导出数据源 */
  measureRef: Ref<HTMLElement | null>;
  /** 当前分页计划，用于阻止无效或溢出的预览进入可视化导出。 */
  pagePlan: ComputedRef<PagePlan>;
  /** 当前预览是否已完成最新一轮测量。 */
  previewReady: ComputedRef<boolean>;
  /** 导出成功回调 */
  onExportSuccess?: () => void;
}

export const useResumeExport = ({
  isEdit,
  rootRef,
  measureRef,
  pagePlan,
  previewReady,
  onExportSuccess,
}: UseResumeExportOptions) => {
  // 编辑器与云端打印共用判定规则，仅按输出布局区别分页与连续长图。
  const canExport = (mode: ExportLayoutMode) => {
    const status = getExportLayoutStatus(previewReady.value, pagePlan.value.status, mode);
    if (status === "pending") {
      ElMessage.warning("简历预览正在更新，请稍后再导出");
      return false;
    }
    if (status === "ready") return true;
    ElMessage.error(
      status === "overflow"
        ? "简历内容超出页面可用区域，请调整后再导出"
        : "简历页面布局配置有误，请调整后再导出",
    );
    return false;
  };
  const canExportMeasure = () => canExport("continuous");
  const canExportPages = () => canExport("pages");
  // 导出成功后才上报埋点，fileType 为导出格式、source 为产出方式
  const reportExport = (fileType: ResumeFileType, source: ResumeExportSource) => () => {
    trackResumeAction({ eventType: "export", fileType, source });
    onExportSuccess?.();
  };
  // 长图 PDF 与 PNG 共用长图渲染结果，保持单页长图输出。
  const printPDF = (scale: unknown = 2) => {
    if (!canExportMeasure()) return;
    return printLongImagePdf(
      measureRef,
      reportExport("pdf", "image"),
      scale === 8 ? 8 : scale === 4 ? 4 : scale === 2 ? 2 : 1,
    );
  };
  // 浏览器打印单独作为导出选项，保留系统打印能力。
  const printBrowserPDF = (scale: unknown = 2) => {
    if (!canExportPages()) return;
    return printResume(rootRef, reportExport("pdf", "local"), scale === 8 ? 8 : scale === 4 ? 4 : scale === 2 ? 2 : 1);
  };
  const printServerPDF = () => {
    if (!canExportPages()) return;
    return exportServerPdf(reportExport("pdf", "server"));
  };
  const printImage = (scale: unknown = 2) => {
    if (!canExportMeasure()) return;
    return exportImage(measureRef, reportExport("png", "image"), scale === 8 ? 8 : scale === 4 ? 4 : scale === 2 ? 2 : 1);
  };
  const printMarkdown = () => exportMarkdown(reportExport("markdown", "local"));
  // 导出可编辑的单文件 HTML
  const printHtml = () => {
    if (!canExportPages()) return;
    return exportHtml(rootRef, reportExport("html", "local"));
  };
  // 仅编辑模式注册全局导出事件
  onMounted(() => {
    if (isEdit.value) {
      eventBus.on("resume-print-pdf", printPDF);
      eventBus.on("resume-print-browser-pdf", printBrowserPDF);
      eventBus.on("resume-print-server-pdf", printServerPDF);
      eventBus.on("resume-print-image", printImage);
      eventBus.on("resume-print-markdown", printMarkdown);
      eventBus.on("resume-print-html", printHtml);
    }
  });
  onUnmounted(() => {
    if (isEdit.value) {
      eventBus.off("resume-print-pdf", printPDF);
      eventBus.off("resume-print-browser-pdf", printBrowserPDF);
      eventBus.off("resume-print-server-pdf", printServerPDF);
      eventBus.off("resume-print-image", printImage);
      eventBus.off("resume-print-markdown", printMarkdown);
      eventBus.off("resume-print-html", printHtml);
    }
  });
};
