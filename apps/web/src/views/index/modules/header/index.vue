<script setup>
import nnLogo from "@/assets/images/userLogo.png";
import { useSystemStore, useThemeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, inject, onMounted, ref, watch } from "vue";
import Music from "./music.vue";

const systemStore = useSystemStore();
const { windowSize } = storeToRefs(systemStore);
const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);

// 导航配置
const NAV_ITEMS = [
  { name: "关于", key: "about" },
  { name: "项目", key: "project" },
  { name: "摄影", key: "shoot" },
  { name: "日志", key: "history" },
];

/**
 * 回到顶部
 */
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/**
 * 处理锚点滚动
 * @param {string} targetId 目标元素ID
 */
function handleAnchorScroll(targetId) {
  const targetElement = document.getElementById(targetId);
  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      duration: 10,
    });
  }
}

// 滚动交互逻辑
const scrollTop = inject("scrollTop", ref(0));
const headerOpacity = ref(0);
const scrollThreshold = computed(() => windowSize.value?.height || 0);

// 动态计算 Header 样式
const headerStyle = computed(() => {
  const isDark = theme.value === "dark";
  const rgbValue = isDark ? "0, 0, 0" : "255, 255, 255";

  return {
    backgroundColor: `rgba(${rgbValue}, ${headerOpacity.value})`,
    borderBottom:
      headerOpacity.value > 0.8 ? "0.5px solid var(--sf-border)" : "0.5px solid transparent",
  };
});

// 监听滚动更新透明度和激活的导航项
const activeKey = ref("");

const updateActiveKey = useThrottleFn(() => {
  let currentActive = "";
  const triggerLine = (windowSize.value?.height || window.innerHeight) / 3;

  for (const item of NAV_ITEMS) {
    const el = document.getElementById(item.key);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= triggerLine && rect.bottom > triggerLine) {
        currentActive = item.key;
        break;
      }
    }
  }
  activeKey.value = currentActive;
}, 100);

watch(scrollTop, (val) => {
  const threshold = scrollThreshold.value;
  if (val < threshold) {
    headerOpacity.value = 0;
  } else {
    // 超过阈值后，根据滚动距离计算透明度，最大 0.8
    const offset = val - threshold;
    headerOpacity.value = Math.min(offset / 400, 0.8);
  }

  updateActiveKey();
});

onMounted(() => {
  updateActiveKey();
});

const isHeaderActive = computed(() => headerOpacity.value > 0);
</script>

<template>
  <header
    class="fixed top-0 left-0 z-50 h-20 w-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
    :class="{ 'shadow-sm backdrop-blur-md dark:shadow-md': isHeaderActive }"
    :style="headerStyle"
  >
    <div class="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
      <!-- Logo 区域 -->
      <div class="flex items-center">
        <SfImg
          :src="nnLogo"
          size="15"
          class="cursor-pointer object-contain transition-transform duration-300 hover:scale-105 md:h-20 md:w-20"
          @click="scrollToTop"
        />
      </div>

      <!-- 右侧功能区 -->
      <div class="flex items-center gap-6 md:gap-8">
        <!-- 导航菜单 -->
        <nav class="flex items-center gap-6">
          <SfSpan
            v-for="item in NAV_ITEMS"
            class="nav-item cursor-pointer py-2 text-[12px] font-medium transition-colors sm:text-[20px]"
            :class="activeKey === item.key ? 'font-bold text-sf-theme' : 'text-sf-base'"
            @click="handleAnchorScroll(item.key)"
            :key="item.key"
          >
            {{ item.name }}
          </SfSpan>
        </nav>

        <!-- 分割线 (仅在大屏显示) -->
        <div class="hidden h-5 w-px bg-sf-border md:block"></div>

        <!-- 工具图标 -->
        <div class="flex items-center gap-4">
          <SfDonation />
          <SfLocale />
          <Music />
          <SfSetting />
          <SfTheme />
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
// 自定义变量
:deep(.sf-icon) {
  transition: color 0.3s ease;
}
</style>
