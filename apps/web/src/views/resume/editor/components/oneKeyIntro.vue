<script setup lang="ts">
import { computed } from "vue";
import type { OneKeyFlow } from "../hooks/useOneKeyActions";

// 一键说明弹窗：优化与调整共用，确认后由入口启动对应通用流程
const visible = defineModel<boolean>({ default: false });
const props = defineProps<{ flow: OneKeyFlow }>();
const emit = defineEmits<{ confirm: [] }>();

// 一键优化的能力说明，替换入口不会改变实际优化流程
const optimizeFeatures = [
  {
    icon: "ph:stethoscope-duotone", // 诊断图标
    title: "全方位诊断", // 能力标题
    description: "从完整度、阅读效率、职业契合、职业成就、发展潜力和稳定性六个维度检查简历。", // 能力说明
  },
  {
    icon: "ph:magic-wand-duotone", // 优化图标
    title: "智能优化", // 能力标题
    description: "结合求职方向优化结构、表达和岗位关键词，让重点更清晰。", // 能力说明
  },
  {
    icon: "fa6-solid:edit", // 增删图标
    title: "必要增删", // 能力标题
    description: "基于已有事实补充必要内容、精简重复套话；缺失事实会标记为待补充。", // 能力说明
  },
  {
    icon: "fa-solid:chart-line", // 报告图标
    title: "优化报告", // 能力标题
    description: "展示六维评分、本次改动、优化亮点和下一步建议，方便继续完善。", // 能力说明
  },
];

// 当前展示优化说明，否则展示调整说明
const isOptimize = computed(() => props.flow === "oneKeyOptimize");

// 用户确认了解功能后交给入口继续进入通用流程
const confirm = () => {
  visible.value = false;
  emit("confirm");
};
</script>

<template>
  <SfModal
    v-model="visible"
    :title="isOptimize ? '一键优化能为你做什么' : $t('oneClickAdjustIntroTitle')"
    :width="isOptimize ? '560px' : '480px'"
  >
    <div v-if="isOptimize" class="flex w-full flex-col gap-3 pb-3 text-left">
      <p class="text-[14px] leading-relaxed text-sf-text-2">
        一次完成简历诊断、内容优化和结果评估，所有改动都可以撤回。
      </p>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          v-for="feature in optimizeFeatures"
          :key="feature.title"
          class="flex gap-3 rounded-xl bg-sf-bg p-3"
        >
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sf-bg-2 text-sf-theme"
          >
            <SfIcon :icon="feature.icon" size="5" />
          </div>
          <div class="flex flex-col gap-3">
            <h3 class="text-[14px] font-bold text-sf-text">{{ feature.title }}</h3>
            <p class="text-[13px] leading-relaxed text-sf-text-2">{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <div class="flex items-start gap-3 rounded-xl bg-sf-bg-2 p-3">
        <SfIcon icon="mdi:database-outline" size="5" class="shrink-0 text-sf-theme" />
        <p class="text-[13px] leading-relaxed text-sf-text-2">
          为保证判断完整，一键优化需要读取整份简历。当前只选择部分模块时，下一步会单独询问读取授权；拒绝后不会发起请求。
        </p>
      </div>

      <div class="flex justify-end gap-3 pt-3">
        <SfButton type="bg" size="large" @click="visible = false"> 暂不优化 </SfButton>
        <SfButton size="large" @click="confirm">开始一键优化</SfButton>
      </div>
    </div>

    <div v-else class="flex w-full flex-col gap-3 pb-3 text-left">
      <p class="text-sm leading-6 text-sf-text-2">
        {{ $t("oneClickAdjustIntroDescription") }}
      </p>
      <div class="flex items-start gap-3 rounded-2xl bg-sf-warning-2 p-3 text-sf-warning">
        <SfIcon icon="lucide:triangle-alert" size="5" class="shrink-0" />
        <p class="text-xs leading-5">{{ $t("oneClickAdjustIntroNotice") }}</p>
      </div>
      <div class="flex justify-end gap-3 pt-3">
        <SfButton type="bg" @click="visible = false">{{ $t("cancel") }}</SfButton>
        <SfButton @click="confirm">{{ $t("startOneClickAdjust") }}</SfButton>
      </div>
    </div>
  </SfModal>
</template>
