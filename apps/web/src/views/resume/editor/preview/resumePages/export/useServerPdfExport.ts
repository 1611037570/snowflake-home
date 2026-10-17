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
import { useResumeName } from "../../../../hooks/useResumeName";

const cloneJson = (value: any) => JSON.parse(JSON.stringify(toRaw(value)));

/**
 * 读取服务端给出的失败原因。
 * 导出接口按 blob 接收响应，出错时响应体同样是 Blob，需要先解出来才能拿到提示。
 */
const readServerErrorMessage = async (error: any): Promise<string> => {
  const data = error?.response?.data;
  if (!(data instanceof Blob)) return "";
  try {
    const parsed = JSON.parse(await data.text());
    // Nest 的 message 既可能是字符串，也可能是字符串数组
    return Array.isArray(parsed?.message) ? parsed.message.join("；") : (parsed?.message ?? "");
  } catch {
    // 响应体不是 JSON，交给通用提示
    return "";
  }
};

export const printServerPDF = async (
  onSuccess?: () => void,
  itemOverride?: any,
) => {
  const resumeStore = useResumeStore();
  const { getExportFileName, resumeTitle } = useResumeName();
  const { selectedModule, currentItem, system } = storeToRefs(resumeStore);
  const signal = resumeStore.beginPrinting();
  if (!signal || !currentItem.value) return;
  // 脱敏导出传入独立副本，普通导出继续读取当前简历。
  const exportItem = itemOverride ?? currentItem.value;
  // 记录导出所属简历，避免旧服务端任务写入新简历状态
  const resumeId = currentItem.value.id;
  const isCurrentResume = () => currentItem.value?.id === resumeId;

  const cachedSelectedModule = [...selectedModule.value];
  resumeStore.clearSelectedModules();

  try {
    const blob = await createResumePdf(
      cloneJson(exportItem),
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
      // 排队已满（503）、渲染超时（408）等原因由服务端给出，读不到才回落到通用提示
      const serverMessage = await readServerErrorMessage(error);
      const fallback =
        error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT"
          ? "导出等待时间过长，请稍后重试。"
          : "服务器PDF生成失败，请确认服务端已启动后重试。";
      ElMessage.error(serverMessage || fallback);
    }
  } finally {
    if (isCurrentResume()) resumeStore.setSelectedModules(cachedSelectedModule);
    resumeStore.finishPrinting(signal);
  }
};
