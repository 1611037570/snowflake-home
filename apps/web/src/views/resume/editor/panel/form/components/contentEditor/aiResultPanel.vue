<script setup lang="ts">
import { computed } from "vue";
import { $t } from "@/locales";

// 字段级正文 AI 结果卡片：流式展示生成结果，由用户确认后写入编辑器
const props = defineProps<{
  // 本次操作类型：generate 生成 / polish 润色 / simplify 简化
  action: "generate" | "polish" | "simplify";
  // 是否正在生成
  loading: boolean;
  // 已清洗的预览正文
  previewHtml: string;
  // 失败信息，为空表示无错误
  errorText: string;
}>();

const emit = defineEmits(["apply", "regenerate", "discard"]);

// 操作类型与文案键的对应关系
const ACTION_LABELS: Record<string, string> = {
  generate: "resumeContentGenerate",
  polish: "resumeContentPolish",
  simplify: "resumeContentSimplify",
};
const actionName = computed(() => $t(ACTION_LABELS[props.action] || "resumeContentGenerate"));
</script>

<template>
  <div class="flex flex-col gap-3 overflow-hidden rounded-b-3xl border-t border-sf-b bg-sf-bg p-3">
    <div class="flex items-center gap-3 text-sm font-semibold text-sf-text">
      <SfIcon
        :icon="props.loading ? 'eos-icons:loading' : 'lucide:sparkles'"
        size="4"
        class="cursor-default text-sf-theme"
      />
      <span>{{ $t("resumeContentResultTitle", { action: actionName }) }}</span>
      <span v-if="props.loading" class="text-xs font-normal text-sf-text-3">
        {{ $t("resumeContentGenerating") }}
      </span>
    </div>

    <p
      v-if="props.errorText"
      class="rounded-3xl bg-sf-error-2 p-3 text-sm leading-relaxed text-sf-error"
    >
      {{ props.errorText }}
    </p>
    <!-- 流式正文实时渲染，内容已由调用方清洗；超出高度由统一滚动条承载 -->
    <SfScrollbar v-else max-height="168px" class="overflow-hidden rounded-3xl bg-sf-primary">
      <div
        class="resume-ai-preview py-3 text-sm leading-relaxed text-sf-text select-text"
        v-html="props.previewHtml"
      ></div>
    </SfScrollbar>

    <!-- 按钮保持内容宽度，空间不足时整块换行，避免中文被逐字竖排 -->
    <div class="flex flex-wrap items-center justify-end gap-3">
      <SfButton
        v-if="props.loading"
        type="bg"
        border
        class="shrink-0 whitespace-nowrap"
        @click="emit('discard')"
      >
        {{ $t("resumeContentStop") }}
      </SfButton>
      <template v-else>
        <SfButton
          class="shrink-0 whitespace-nowrap"
          :disabled="!props.previewHtml"
          @click="emit('apply')"
        >
          {{ $t("resumeContentApply") }}
        </SfButton>
        <SfButton type="bg" border class="shrink-0 whitespace-nowrap" @click="emit('regenerate')">
          {{ $t("resumeContentRegenerate") }}
        </SfButton>
        <SfButton type="bg" border class="shrink-0 whitespace-nowrap" @click="emit('discard')">
          {{ $t("resumeContentDiscard") }}
        </SfButton>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* 预览正文沿用编辑器段间距，避免 Tailwind 重置后段落粘连 */
.resume-ai-preview :deep(p) {
  margin: 0 0 10px;
}

.resume-ai-preview :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
