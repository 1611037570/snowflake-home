import { storeToRefs } from "pinia";
import { toRaw } from "vue";
import { useResumeStore } from "@/stores";
import router from "@/routers";
import type { Ref } from "vue";

type ResumeRootRef = Ref<HTMLElement | null>;

const BROWSER_PRINT_READY = "snowflake-resume-browser-print-ready";
const BROWSER_PRINT_DATA = "snowflake-resume-browser-print-data";
const BROWSER_PRINT_DONE = "snowflake-resume-browser-print-done";

// 复制简历数据，保留简历内容中的 Base64 图片。
const cloneJson = (value: unknown) => JSON.parse(JSON.stringify(toRaw(value)));

// 使用已有简历打印页，避免在当前编辑页重复实现排版逻辑。
const getPrintUrl = (token: string) => {
  const href = router.resolve({
    name: "resume-print",
    query: { browserPrint: "1", token },
  }).href;
  return new URL(href, window.location.origin).href;
};

// 使用简历打印页的原生 DOM 和系统打印，不将页面转换为图片。
export const printResume = async (
  rootRef: ResumeRootRef,
  onSuccess?: () => void,
  scale = 1,
) => {
  void rootRef;
  void scale;

  const resumeStore = useResumeStore();
  const { currentItem, system } = storeToRefs(resumeStore);
  if (!currentItem.value) return;

  const signal = resumeStore.beginPrinting();
  if (!signal) return;

  const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const payload = {
    item: cloneJson(currentItem.value),
    system: cloneJson(system.value),
  };
  let printWindow: Window | null = null;
  let restored = false;

  const restorePrintState = (success = false) => {
    if (restored) return;
    restored = true;
    window.removeEventListener("message", handleMessage);
    resumeStore.finishPrinting(signal);
    if (success) onSuccess?.();
  };

  const handleMessage = (event: MessageEvent) => {
    if (
      event.origin !== window.location.origin ||
      event.source !== printWindow ||
      event.data?.token !== token
    ) {
      return;
    }

    if (event.data.type === BROWSER_PRINT_READY) {
      printWindow?.postMessage(
        { type: BROWSER_PRINT_DATA, token, payload },
        window.location.origin,
      );
    } else if (event.data.type === BROWSER_PRINT_DONE) {
      restorePrintState(true);
    }
  };

  window.addEventListener("message", handleMessage);

  try {
    printWindow = window.open(getPrintUrl(token), "_blank");
    if (!printWindow) {
      restorePrintState();
      console.error("浏览器打印窗口打开失败");
      return;
    }

    signal.addEventListener(
      "abort",
      () => {
        printWindow?.close();
        restorePrintState();
      },
      { once: true },
    );
  } catch (error) {
    restorePrintState();
    console.error("打开浏览器打印失败:", error);
  }
};
