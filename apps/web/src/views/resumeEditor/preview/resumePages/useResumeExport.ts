/**
 * useResumeExport —— 简历导出功能
 *
 * 管理 PDF / 图片导出的全局事件注册与注销（仅编辑态注册，缩略图/全屏预览不注册），
 * 导出范围由本实例的根节点 ref 限定，避免误选其他 ResumePages 实例的页面。
 */
import { onMounted, onUnmounted, type ComputedRef, type Ref } from "vue";
import eventBus from "@/utils/modules/eventBus";
import { printPDF as exportPdf } from "./usePdfExport";
import { printImage as exportImage } from "./useImageExport";
/** useResumeExport 入参 */
interface UseResumeExportOptions {
  /** 编辑态才注册导出事件，其余模式（缩略图/全屏预览）不注册 */
  isEdit: ComputedRef<boolean>;
  /** 本实例分页根节点 ref：限定 PDF 导出范围 */
  rootRef: Ref<HTMLElement | null>;
  /** 测量容器 ref：图片导出数据源 */
  measureRef: Ref<HTMLElement | null>;
}

export const useResumeExport = ({ isEdit, rootRef, measureRef }: UseResumeExportOptions) => {
  const printPDF = () => exportPdf(rootRef);
  const printImage = () => exportImage(measureRef);
  // 仅编辑模式注册全局导出事件
  onMounted(() => {
    if (isEdit.value) {
      eventBus.on("resume-print-pdf", printPDF);
      eventBus.on("resume-print-image", printImage);
    }
  });
  onUnmounted(() => {
    if (isEdit.value) {
      eventBus.off("resume-print-pdf", printPDF);
      eventBus.off("resume-print-image", printImage);
    }
  });
};
