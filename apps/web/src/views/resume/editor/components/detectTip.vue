<template>
  <div class="hidden"></div>
</template>

<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, h, onBeforeUnmount, onMounted, watch } from "vue";
import { ElNotification } from "element-plus";

const resumeStore = useResumeStore();
const { system } = storeToRefs(resumeStore);

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

// ---------- 用户开关 ----------
const browserEnabled = computed(() => system.value.showBrowserTip !== false);

// ---------- 通知实例与辅助变量 ----------
let browserTipInstance = null;

// ---------- 关闭函数 ----------
function closeBrowserTip() {
  if (browserTipInstance) {
    browserTipInstance.close();
    browserTipInstance = null;
  }
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

// ---------- 主更新逻辑（可复用） ----------
function updateBrowserTip() {
  // 浏览器提示
  if (browserEnabled.value && !isRecommendedBrowser.value) {
    createBrowserTip();
  } else {
    closeBrowserTip();
  }
}

// ---------- 生命周期 ----------
// 首次挂载立即显示（保留原行为）
onMounted(updateBrowserTip);

watch(browserEnabled, updateBrowserTip);

// 卸载时清理所有资源
onBeforeUnmount(() => {
  closeBrowserTip();
});
</script>
