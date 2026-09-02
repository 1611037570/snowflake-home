<template>
  <div class="hidden"></div>
</template>

<script setup>
import { useResumeStore } from "@/stores";
import { DEFAULT_EDITOR } from "@/stores/modules/resume/defaultConfig";
import { storeToRefs } from "pinia";
import { computed, h, onBeforeUnmount, onMounted, watch } from "vue";
import { ElNotification } from "element-plus";
import { useWindowSize, useDebounceFn } from "@vueuse/core"; // 请按实际路径调整

const resumeStore = useResumeStore();
const { system, layout, focusMode } = storeToRefs(resumeStore);

const RECOMMEND_BROWSER = "谷歌浏览器";
const DOWNLOAD_URL = "https://www.google.cn/intl/zh-CN/chrome/";

// 浏览器检测
const browser = computed(() => {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("edg")) return "Edge";
  if (ua.includes("opr") || ua.includes("opera")) return "Opera";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("chrome")) return "Chrome";
  return "其他";
});
const isRecommendedBrowser = computed(() => browser.value === "Chrome");

// 窗口与侧栏宽度计算
const { width: windowWidth } = useWindowSize();
const editorWidth = DEFAULT_EDITOR.editorWidth;
const assistantWidth = DEFAULT_EDITOR.assistantWidth;
const sideWidth = computed(() => {
  const builderVisible = focusMode.value || layout.value !== "ai";
  const assistantVisible = !focusMode.value && layout.value !== "list";
  return (builderVisible ? editorWidth : 0) + (assistantVisible ? assistantWidth : 0);
});
const previewWidth = computed(() => windowWidth.value - sideWidth.value);
const isOverflow = computed(() => previewWidth.value < 200);
// 是否可切换两栏布局：窗口宽度 1000 以内且当前为三栏布局
const canSwitchLayout = computed(() => windowWidth.value <= 1000 && layout.value === "three");

// 用户开关
const windowEnabled = computed(() => system.value.showWindowTip !== false);
const browserEnabled = computed(() => system.value.showBrowserTip !== false);

// 通知实例（每个类型仅一个）
let browserTipInstance = null;
let windowTipInstance = null;
// 窗口提示 3 秒无变化自动关闭定时器
let windowTipTimer = null;
// 当前窗口提示是否已包含布局切换按钮
let windowTipWithButtons = false;

// 创建浏览器提示
const createBrowserTip = () => {
  if (browserTipInstance) return;
  browserTipInstance = ElNotification({
    title: "浏览器建议",
    message: h("div", { class: "flex flex-col items-start gap-2" }, [
      h("span", `推荐使用${RECOMMEND_BROWSER}获得最佳体验，当前浏览器可能会遇到兼容性或性能问题。`),
      h("div", { class: "flex items-center gap-2" }, [
        h(
          "a",
          {
            href: DOWNLOAD_URL,
            target: "_blank",
            class: "rounded-full bg-sf-theme px-3 py-1 text-sm text-sf-theme-text",
          },
          `去下载${RECOMMEND_BROWSER}`,
        ),
        h(
          "button",
          {
            type: "button",
            class:
              "cursor-pointer rounded-full bg-sf-bg-2 px-3 py-1 text-sm text-sf-text-2 hover:text-sf-theme",
            onClick: () => {
              system.value.showBrowserTip = false;
              browserTipInstance?.close();
              browserTipInstance = null;
            },
          },
          "不再提醒",
        ),
      ]),
    ]),
    type: "warning",
    position: "top-right",
    offset: 40,
    duration: 0, // 不自动关闭
    showClose: true,
    onClose: () => {
      browserTipInstance = null;
    },
  });
};

// 创建窗口提示
const createWindowTip = () => {
  // 布局切换按钮显示条件变化时，关闭旧提示重建以刷新按钮
  if (windowTipInstance && windowTipWithButtons !== canSwitchLayout.value) {
    const oldInstance = windowTipInstance;
    windowTipInstance = null;
    oldInstance.close();
  }
  if (windowTipInstance) return;
  windowTipWithButtons = canSwitchLayout.value;
  const instance = ElNotification({
    title: "窗口过小",
    message: h("div", { class: "flex flex-col items-start gap-2" }, [
      h("span", "窗口太小影响编辑体验，请进行调整。"),
      // 仅窗口宽度 1000 以内且当前为三栏布局时，提供两栏切换按钮
      ...(canSwitchLayout.value
        ? [
            h("div", { class: "flex items-center gap-2" }, [
              // 切换为编辑+预览布局
              h(
                "button",
                {
                  type: "button",
                  class:
                    "cursor-pointer rounded-full bg-sf-theme px-3 py-1 text-sm text-sf-theme-text",
                  onClick: () => resumeStore.setLayout("list"),
                },
                "编辑+预览",
              ),
              // 切换为预览+AI布局
              h(
                "button",
                {
                  type: "button",
                  class:
                    "cursor-pointer rounded-full bg-sf-theme px-3 py-1 text-sm text-sf-theme-text",
                  onClick: () => resumeStore.setLayout("ai"),
                },
                "预览+AI",
              ),
            ]),
          ]
        : []),
      h(
        "button",
        {
          type: "button",
          class:
            "cursor-pointer rounded-full bg-sf-bg-2 px-3 py-1 text-sm text-sf-text-2 hover:text-sf-theme",
          onClick: () => {
            system.value.showWindowTip = false;
            windowTipInstance?.close();
            windowTipInstance = null;
          },
        },
        "不再提醒",
      ),
    ]),
    type: "error",
    position: "top-right",
    offset: 40,
    duration: 0,
    showClose: true,

    onClose: () => {
      // 仅当仍是当前提示实例时才清空引用，避免误清重建后的新提示
      if (windowTipInstance === instance) windowTipInstance = null;
    },
  });
  windowTipInstance = instance;
};

// 重置窗口提示自动关闭定时器：窗口 3 秒无变化后关闭提示
const resetWindowTipTimer = () => {
  clearTimeout(windowTipTimer);
  windowTipTimer = setTimeout(() => {
    windowTipInstance?.close();
    windowTipInstance = null;
  }, 3000);
};

// 统一更新逻辑
const updateTips = () => {
  // 浏览器提示
  if (browserEnabled.value && !isRecommendedBrowser.value) {
    createBrowserTip();
  } else {
    if (browserTipInstance) {
      browserTipInstance.close();
      browserTipInstance = null;
    }
  }

  // 窗口提示
  if (windowEnabled.value && isOverflow.value) {
    createWindowTip();
    // 窗口持续变化时重置定时器，保持提示显示
    resetWindowTipTimer();
  } else {
    if (windowTipInstance) {
      windowTipInstance.close();
      windowTipInstance = null;
    }
    clearTimeout(windowTipTimer);
  }
};

let stopWatch = null;
onMounted(() => {
  updateTips();
  stopWatch = watch(
    [windowWidth, layout, focusMode],
    // 100ms 防抖，连续变化时最多 500ms 执行一次，持续刷新提示显示与自动关闭定时器
    useDebounceFn(updateTips, 100, { maxWait: 500 }),
    { immediate: false },
  );
});
onBeforeUnmount(() => {
  stopWatch?.();
  clearTimeout(windowTipTimer);
});
</script>
