<script setup>
import { useResumeStore } from "@/stores";
import { themeTemplateList } from "@/stores/modules/resume/uiConfig";
import { xiaoYangResumeItem } from "@/stores/modules/resume/xiaoYangData";
import ResumeCardContainer from "@/views/resume/mine/components/resumeCardContainer.vue";
import { computed, onMounted, onUnmounted, ref } from "vue";

const resumeStore = useResumeStore();

// 深拷贝：套用模板时隔离示例数据，避免与模板预览共享引用导致互相串改
const deepClone = (value) => JSON.parse(JSON.stringify(value));

// 全部模板：遍历风格模板，统一使用小羊示例数据预览，仅覆盖风格
const templates = computed(() =>
  themeTemplateList.map((style, index) => ({
    id: style.value,
    name: style.name,
    value: style.value,
    revealIndex: index,
    item: {
      data: xiaoYangResumeItem.data,
      config: xiaoYangResumeItem.config,
      fixedConfig: xiaoYangResumeItem.fixedConfig,
      ui: { ...xiaoYangResumeItem.ui, themeTemplate: style.value },
    },
  })),
);

const total = computed(() => templates.value.length);

// 入场动画：逐个添加，每隔一段时间揭示一张卡片
const visibleCount = ref(0);
let revealTimer = null;
onMounted(() => {
  revealTimer = setInterval(() => {
    visibleCount.value += 1;
    if (visibleCount.value >= total.value) {
      clearInterval(revealTimer);
      revealTimer = null;
    }
  }, 120);
});
onUnmounted(() => {
  if (revealTimer) clearInterval(revealTimer);
});

// 已揭示的模板（按揭示顺序追加，TransitionGroup 仅触发 enter，无需 move）
const visibleTemplates = computed(() =>
  templates.value.filter((t) => t.revealIndex < visibleCount.value),
);

// 套用模板：携带风格，深拷贝数据后新增简历并进入编辑
const useTemplate = (card) => {
  resumeStore.addResume({
    data: deepClone(xiaoYangResumeItem.data),
    config: deepClone(xiaoYangResumeItem.config),
    fixedConfig: deepClone(xiaoYangResumeItem.fixedConfig),
    ui: { ...xiaoYangResumeItem.ui, themeTemplate: card.value },
  });
};
</script>

<template>
  <SfScrollbar class="h-full">
    <div class="relative z-4 mx-auto flex w-[1164px] flex-col gap-4 py-4">
      <!-- 标题 -->
      <div class="flex items-end justify-between">
        <div>
          <h2 class="text-[20px] font-black text-sf-theme">简历模板</h2>
          <p class="mt-1 text-sm text-sf-text-2">
            全部模板均使用小羊示例数据预览，选择喜欢的风格即可套用并进入编辑
          </p>
        </div>
        <span class="shrink-0 text-xs text-sf-text-3">共 {{ total }} 款</span>
      </div>

      <!-- 模板列表 -->
      <TransitionGroup tag="div" name="tpl" class="grid grid-cols-4 gap-3">
        <div v-for="card in visibleTemplates" :key="card.id" class="w-[282px]">
          <ResumeCardContainer :item="card.item" @click="useTemplate(card)">
            <div class="mt-3 flex items-center justify-between gap-2">
              <div class="min-w-0">
                <div class="truncate text-base font-black text-sf-text">{{ card.name }}</div>
                <div class="mt-1 truncate text-sm text-sf-text-2">点击套用该风格</div>
              </div>
              <span
                class="shrink-0 rounded-lg bg-sf-theme-2 px-2.5 py-1 text-xs font-black text-sf-theme"
                >使用</span
              >
            </div>
          </ResumeCardContainer>
        </div>
      </TransitionGroup>
    </div>
  </SfScrollbar>
</template>

<style>
/* 模板卡片入场动画：逐个揭示时由 TransitionGroup 自动添加类名驱动 */
.tpl-enter-active {
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.tpl-enter-from {
  opacity: 0;
  transform: translateY(28px) scale(0.94);
}
</style>
