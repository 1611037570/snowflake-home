import { usePerformanceObserver } from "@vueuse/core";
import { useResumeStore } from "@/stores";
import { getBrowser } from "@/utils";

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

  // 采集运行环境：延后到浏览器空闲时执行，避免占用渲染关键路径
  const collectEnv = () => {
    // 采集过程整体容错，任何取值失败都不影响编辑器使用
    const run = () => {
      try {
        const browser = getBrowser();
        resumeStore.runtimeData.env = {
          // 设备类型（电脑/平板/手机）
          device: browser.deviceType,
          // 浏览器类型
          browser: browser.type,
          // 操作系统平台
          platform: browser.plat,
          // 屏幕档位
          screenGrade: browser.screen,
          // 视口尺寸
          viewport: `${browser.width}x${browser.height}`,
          // 屏幕分辨率
          resolution: `${screen.width}x${screen.height}`,
          // 设备像素比
          dpr: window.devicePixelRatio,
          // CPU 逻辑核心数
          cores: navigator.hardwareConcurrency,
          // 设备内存（GB）
          memory: (navigator as any).deviceMemory,
          // 网络类型
          network: (navigator as any).connection?.effectiveType,
          // 界面语言
          language: navigator.language,
          // 时区
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          // 是否触屏设备
          touch: "ontouchstart" in window,
        };
      } catch {}
    };
    const idle = (window as any).requestIdleCallback;
    if (idle) idle(run, { timeout: 3000 });
    else setTimeout(run, 300);
  };

  return {
    markEditorStart,
    markEditorEnd,
    markPreviewStart,
    markPreviewEnd,
    collectFirstFrame,
    collectEnv,
  };
}
