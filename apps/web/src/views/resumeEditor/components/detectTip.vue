<template>
  <div class="hidden"></div>
</template>

<script setup>
import { useResumeStore } from "@/stores";
import { DEFAULT_EDITOR } from "@/stores/modules/resume/defaultConfig";
import { storeToRefs } from "pinia";
import { computed, h, onBeforeUnmount, onMounted, watch } from "vue";
import { ElNotification } from "element-plus";
import { useWindowSize, useDebounceFn } from "@vueuse/core";

const resumeStore = useResumeStore();
const { system, layout, focusMode } = storeToRefs(resumeStore);

const RECOMMEND_BROWSER = "谷歌浏览器";
const DOWNLOAD_URL = "https://www.google.cn/intl/zh-CN/chrome/";

// ---------- 浏览器检测 ----------
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

// ---------- 窗口与布局计算 ----------
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
const canSwitchLayout = computed(() => windowWidth.value <= 1000 && layout.value === "three");

// ---------- 用户开关 ----------
const windowEnabled = computed(() => system.value.showWindowTip !== false);
const browserEnabled = computed(() => system.value.showBrowserTip !== false);

// ---------- 通知实例与辅助变量 ----------
let browserTipInstance = null;
let windowTipInstance = null;
let windowTipTimer = null;
let lastWindowTipCanSwitch = false; // 记录上次按钮状态，避免重复重建

// ---------- 关闭函数 ----------
function closeBrowserTip() {
  if (browserTipInstance) {
    browserTipInstance.close();
    browserTipInstance = null;
  }
}

function closeWindowTip() {
  if (windowTipInstance) {
    windowTipInstance.close();
    windowTipInstance = null;
  }
  clearTimeout(windowTipTimer);
  windowTipTimer = null;
}

// ---------- 创建函数 ----------
function createBrowserTip() {
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
              closeBrowserTip();
            },
          },
          "不再提醒",
        ),
      ]),
    ]),
    type: "warning",
    position: "top-right",
    offset: 40,
    duration: 0,
    showClose: true,
    onClose: () => {
      browserTipInstance = null;
    },
  });
}

function createWindowTip() {
  // 若按钮状态变化，关闭旧提示并重建
  if (windowTipInstance && lastWindowTipCanSwitch !== canSwitchLayout.value) {
    closeWindowTip();
  }
  if (windowTipInstance) return;
  lastWindowTipCanSwitch = canSwitchLayout.value;

  const instance = ElNotification({
    title: "窗口过小",
    message: h("div", { class: "flex flex-col items-start gap-2" }, [
      h("span", "窗口太小影响编辑体验，请进行调整。"),
      ...(canSwitchLayout.value
        ? [
            h("div", { class: "flex items-center gap-2" }, [
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
            closeWindowTip();
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
      if (windowTipInstance === instance) {
        windowTipInstance = null;
      }
    },
  });
  windowTipInstance = instance;
}

// ---------- 定时器重置 ----------
function resetWindowTipTimer() {
  clearTimeout(windowTipTimer);
  windowTipTimer = setTimeout(() => {
    closeWindowTip();
  }, 3000);
}

// ---------- 主更新逻辑（可复用） ----------
function updateTips() {
  // 浏览器提示
  if (browserEnabled.value && !isRecommendedBrowser.value) {
    createBrowserTip();
  } else {
    closeBrowserTip();
  }

  // 窗口提示
  if (windowEnabled.value && isOverflow.value) {
    createWindowTip();
    resetWindowTipTimer();
  } else {
    closeWindowTip();
  }
}

// ---------- 生命周期 ----------
// 首次挂载立即显示（保留原行为）
onMounted(() => {
  updateTips();
});

// 后续依赖变化时防抖更新（100ms 延迟，最多 500ms 执行一次）
const debouncedUpdate = useDebounceFn(updateTips, 100, { maxWait: 500 });
const stopWatch = watch(
  [windowWidth, layout, focusMode],
  debouncedUpdate,
  { immediate: false }, // 不立即执行，因为 onMounted 已执行
);

// 卸载时清理所有资源
onBeforeUnmount(() => {
  stopWatch?.();
  closeBrowserTip();
  closeWindowTip();
  clearTimeout(windowTipTimer);
});
</script>
