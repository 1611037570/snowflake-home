<script setup lang="ts">
import { computed } from "vue";
import { $t } from "@/locales";
import ThumbPreview from "@/views/resume/editor/preview/modes/thumb.vue";
import { useAiResumeDraft } from "./useAiResumeDraft";

defineOptions({ name: "AiGenerateFlow" });

const emit = defineEmits<{
  // 用户确认预览结果后交出已经套用入口样式的简历数据。
  confirm: [item: Record<string, any>];
}>();

const {
  generating,
  generationStage,
  pendingItem,
  generationWarnings,
  generationInput,
  start,
  generate,
  cancel,
  backToInput,
  reset,
} = useAiResumeDraft();

// 结果存在时入口需要更宽的画布展示预览。
const hasResult = computed(() => !!pendingItem.value);
const generationStatus = computed(() => $t(`resumeAiGenerateStage_${generationStage.value}`));

// 预览确认后才由入口创建简历并跳转，生成阶段不修改用户数据。
const confirmGenerated = () => {
  if (!pendingItem.value) return;
  emit("confirm", pendingItem.value);
};

// 入口通过 start 带入本次来源样式与预填资料，页面与弹窗共用同一入口。
defineExpose({ start, reset, hasResult });
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-6">
    <!-- ReAct 执行期间展示当前阶段，避免用户误以为入口没有响应。 -->
    <div v-if="generating" class="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 text-center">
      <span class="flex h-18 w-18 items-center justify-center rounded-full bg-sf-theme-3 text-sf-theme">
        <SfIcon icon="lucide:loader-circle" size="9" class="animate-spin" />
      </span>
      <div>
        <h3 class="text-xl font-black text-sf-text">{{ $t("resumeAiGenerateWorkingTitle") }}</h3>
        <p class="mt-3 text-sm text-sf-text-2">{{ generationStatus }}</p>
      </div>
      <SfButton plain @click="cancel">{{ $t("resumeAiGenerateCancel") }}</SfButton>
    </div>
    <!-- 生成结果先在当前区域预览，确认后才交给入口创建简历。 -->
    <div v-else-if="pendingItem" class="flex min-h-0 flex-1 flex-col gap-6 md:flex-row">
      <div class="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-sf-b bg-sf-bg">
        <ThumbPreview :item="pendingItem" />
      </div>
      <aside class="flex shrink-0 flex-col gap-6 md:w-[300px]">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-sf-success-2 text-sf-success">
          <SfIcon icon="lucide:file-check-2" size="6" />
        </div>
        <div>
          <h3 class="text-xl font-black text-sf-text">{{ $t("resumeAiGenerateResultTitle") }}</h3>
          <p class="mt-3 text-sm leading-7 text-sf-text-2">
            {{ $t("resumeAiGenerateResultDescription") }}
          </p>
          <p v-if="generationWarnings.length" class="mt-3 text-sm leading-6 text-sf-warning">
            {{ $t("resumeAiGenerateConversionWarnings", { count: generationWarnings.length }) }}
          </p>
          <ul v-if="generationWarnings.length" class="mt-3 max-h-24 list-disc overflow-auto pl-3 text-xs leading-6 text-sf-warning">
            <li v-for="(warning, index) in generationWarnings" :key="index">{{ warning }}</li>
          </ul>
        </div>
        <div class="mt-auto flex flex-col gap-3">
          <SfButton size="large" icon="lucide:check" :disabled="generating" @click="confirmGenerated">
            {{ $t("resumeAiGenerateUseResult") }}
          </SfButton>
          <SfButton size="large" plain icon="lucide:refresh-cw" :disabled="generating" @click="generate">
            {{ generating ? $t("resumeAiGenerating") : $t("resumeAiGenerateAgain") }}
          </SfButton>
          <SfButton size="large" type="bg" :disabled="generating" @click="backToInput">
            {{ $t("resumeAiGenerateBackToEdit") }}
          </SfButton>
        </div>
      </aside>
    </div>
    <!-- 输入表单：只要求岗位与年限，其余真实资料自愿补充。 -->
    <div v-else class="flex min-h-0 flex-1 flex-col gap-6">
      <p class="text-sm text-sf-text-2">{{ $t("resumeAiGenerateInputDescription") }}</p>
      <label class="flex flex-col gap-3 text-sm text-sf-text">
        <span>{{ $t("resumeAiGeneratePositionTitle") }}</span>
        <SfInput
          v-model="generationInput.position"
          :disabled="generating"
          :placeholder="$t('resumeAiGeneratePositionPlaceholder')"
        />
      </label>
      <label class="flex flex-col gap-3 text-sm text-sf-text">
        <span>{{ $t("resumeAiGenerateWorkYearsTitle") }}</span>
        <SfInput
          v-model="generationInput.workYears"
          :disabled="generating"
          :placeholder="$t('resumeAiGenerateWorkYearsPlaceholder')"
        />
      </label>
      <label class="flex min-h-0 flex-1 flex-col gap-3 text-sm text-sf-text">
        <span>{{ $t("resumeAiGenerateSupplementTitle") }}</span>
        <SfInput
          v-model="generationInput.supplement"
          type="textarea"
          :rows="7"
          resize="none"
          :disabled="generating"
          :placeholder="$t('resumeAiGenerateSupplementPlaceholder')"
          class="min-h-0 flex-1 border border-sf-b bg-sf-bg"
        />
      </label>
      <div class="flex justify-end">
        <SfButton icon="lucide:wand-sparkles" :disabled="generating" @click="generate">
          {{ $t("resumeAiGenerateAction") }}
        </SfButton>
      </div>
    </div>
  </div>
</template>
