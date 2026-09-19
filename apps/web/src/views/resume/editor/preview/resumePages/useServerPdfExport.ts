/**
 * serverPdfExport —— 通过后端浏览器排版导出简历 PDF。
 *
 * 后端复用打印路由中的 HTML/CSS 渲染结果，PDF 内保留文本与矢量布局。
 */
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { toRaw } from "vue";
import { useResumeStore } from "@/stores";
import { createResumePdf } from "@/apis/request/modules/snowflake";
import { getExportFileName, resumeTitle } from "../../resumeName";

const cloneJson = (value: any) => JSON.parse(JSON.stringify(toRaw(value)));

export const printServerPDF = async (
  rootRef?: { value: HTMLElement | null },
  onSuccess?: () => void,
  scale = 2,
) => {
  void rootRef;
  void scale;

  const resumeStore = useResumeStore();
  const { selectedModule, currentItem, system } = storeToRefs(resumeStore);
  const signal = resumeStore.beginPrinting();
  if (!signal || !currentItem.value) return;
  // 记录导出所属简历，避免旧服务端任务写入新简历状态
  const resumeId = currentItem.value.id;
  const isCurrentResume = () => currentItem.value?.id === resumeId;

  const cachedSelectedModule = [...selectedModule.value];
  resumeStore.clearSelectedModules();

  try {
    const blob = await createResumePdf(
      cloneJson(currentItem.value),
      cloneJson(system.value),
      signal,
    );
    if (signal.aborted || !isCurrentResume()) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getExportFileName(resumeTitle.value, "pdf");
    link.click();
    URL.revokeObjectURL(url);
    if (isCurrentResume()) onSuccess?.();
  } catch (error) {
    if (!signal.aborted && isCurrentResume()) {
      console.error("生成服务器PDF失败:", error);
      ElMessage.error("服务器PDF生成失败，请确认服务端已启动后重试。");
    }
  } finally {
    if (isCurrentResume()) resumeStore.setSelectedModules(cachedSelectedModule);
    resumeStore.finishPrinting(signal);
  }
};
