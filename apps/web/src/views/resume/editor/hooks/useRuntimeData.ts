import { usePerformanceObserver } from "@vueuse/core";
import { useResumeStore } from "@/stores";

// 运行性能数据记录：store 只负责保存，写入与去重逻辑统一在此处理
export function useRuntimeData() {
  const resumeStore = useResumeStore();

  // 仅在未记录时写入，避免后续渲染覆盖首次加载数据
  const record = (key: keyof typeof resumeStore.runtimeData, value: number) => {
    if (resumeStore.runtimeData[key]) return;
    resumeStore.runtimeData[key] = Math.round(value);
  };

  // 记录编辑区加载开始
  const markEditorStart = () => record("editorStart", performance.now());
  // 记录编辑区加载完成
  const markEditorEnd = () => record("editorEnd", performance.now());
  // 记录预览区加载开始
  const markPreviewStart = () => record("previewStart", performance.now());
  // 记录预览区加载完成
  const markPreviewEnd = () => record("previewEnd", performance.now());
  // 采集简历编辑器首屏首帧：buffered 读取历史绘制条目，避免注册时机错过首次绘制
  const collectFirstFrame = () => {
    usePerformanceObserver({ type: "paint", buffered: true }, (list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") record("firstFrame", entry.startTime);
      }
    });
  };

  return { markEditorStart, markEditorEnd, markPreviewStart, markPreviewEnd, collectFirstFrame };
}
