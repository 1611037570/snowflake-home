<script setup lang="ts">
import { computed } from "vue";
import { $t } from "@/locales";

// 单个候选的展示状态
type Candidate = {
  // 已清洗的候选正文
  html: string;
  // 该候选的失败信息
  error: string;
};

// 字段级正文 AI 结果卡片：流式展示多个候选，由用户确认后写入编辑器
const props = defineProps<{
  // 本次操作类型：generate 生成 / polish 润色 / simplify 简化
  action: "generate" | "polish" | "simplify";
  // 是否正在生成
  loading: boolean;
  // 候选列表，数量与生成数一致
  candidates: Candidate[];
  // 当前展示的候选下标
  activeIndex: number;
}>();

const emit = defineEmits(["apply", "regenerate", "discard", "select"]);

// 操作类型与文案键的对应关系
const ACTION_LABELS: Record<string, string> = {
  generate: "resumeContentGenerate",
  polish: "resumeContentPolish",
  simplify: "resumeContentSimplify",
};
const actionName = computed(() => $t(ACTION_LABELS[props.action] || "resumeContentGenerate"));
// 当前展示的候选
const activeCandidate = computed(() => props.candidates[props.activeIndex]);
// 多个候选时显示切换
const hasMultiple = computed(() => props.candidates.length > 1);
</script>

<template>
  <div class="flex flex-col gap-3 overflow-hidden rounded-b-3xl border-t border-sf-b bg-sf-module-header p-3">
    <div class="flex items-center gap-3 text-sm font-semibold text-sf-text">
      <SfIcon
        :icon="props.loading ? 'eos-icons:loading' : 'lucide:sparkles'"
        size="4"
        class="cursor-default text-sf-theme"
      />
      <span>{{ $t("resumeContentResultTitle", { action: actionName }) }}</span>
      <!-- 多候选时切换当前查看的版本 -->
      <div v-if="hasMultiple" class="ml-auto flex items-center gap-1">
        <button
          v-for="(candidate, index) in props.candidates"
          :key="index"
          type="button"
          class="inline-flex h-5 cursor-pointer items-center rounded-full px-2 text-xs font-normal transition-colors"
          :class="index === props.activeIndex ? 'bg-sf-theme text-sf-theme-text' : 'bg-sf-primary text-sf-text-2 hover:text-sf-text'"
          @click="emit('select', index)"
        >
          候选 {{ index + 1 }}
        </button>
      </div>
    </div>

    <p
      v-if="activeCandidate?.error"
      class="rounded-3xl bg-sf-error-2 p-3 text-sm leading-relaxed text-sf-error"
    >
      {{ activeCandidate.error }}
    </p>
    <!-- 流式正文实时渲染，内容已由调用方清洗；超出高度由统一滚动条承载 -->
    <SfScrollbar v-else max-height="168px" class="overflow-hidden rounded-3xl bg-sf-primary">
      <p v-if="props.loading && !activeCandidate?.html" class="py-3 text-xs text-sf-text-3">
        {{ $t("resumeContentGenerating") }}
      </p>
      <div
        v-else
        class="resume-ai-preview py-3 text-sm leading-relaxed text-sf-text select-text"
        v-html="activeCandidate?.html || ''"
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
          :disabled="!activeCandidate?.html || !!activeCandidate?.error"
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
/* 预览正文沿用编辑器段间距与列表符号，避免 Tailwind 重置后结构不可见 */
.resume-ai-preview :deep(p) {
  margin: 0 0 10px;
}

.resume-ai-preview :deep(p:last-child) {
  margin-bottom: 0;
}

.resume-ai-preview :deep(ul),
.resume-ai-preview :deep(ol) {
  margin: 0 0 10px;
  padding-left: 18px;
}

.resume-ai-preview :deep(ul) {
  list-style: disc;
}

.resume-ai-preview :deep(ol) {
  list-style: decimal;
}

.resume-ai-preview :deep(li) {
  margin: 2px 0;
}
</style>
