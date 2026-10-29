<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useResumeStore } from "@/stores";
import { trackResumeAction } from "@/hooks";
import { $t } from "@/locales";
import AiGenerateFlow from "@/views/resume/components/aiGenerate/aiGenerateFlow.vue";
import type { AiGenerateFlowHandle } from "@/views/resume/components/aiGenerate/useAiResumeDraft";

const resumeStore = useResumeStore();
const flow = ref<AiGenerateFlowHandle | null>(null);

// 页面常驻，进入即准备一轮空白生成：不预设模板，由流程组件展示输入表单。
onMounted(() => flow.value?.start({}));

// 确认结果后沿用其他入口的创建与统计流程，addResume 会进入编辑器。
const handleConfirm = (item: Record<string, any>) => {
  if (!resumeStore.addResume(item)) return;
  trackResumeAction({ eventType: "create", fileType: "none" });
  flow.value?.reset();
};
</script>

<template>
  <SfScrollbar class="h-full bg-sf-page" flush>
    <main class="mx-auto flex w-full max-w-7xl flex-col gap-3 p-3 text-sf-text">
      <header>
        <h1 class="text-lg font-semibold text-sf-text">{{ $t("resumeGeneratePageTitle") }}</h1>
        <p class="mt-[6px] max-w-3xl text-xs leading-6 text-sf-text-2">
          {{ $t("resumeGeneratePageDescription") }}
        </p>
      </header>
      <!-- 生成流程与其他入口共用同一组件，页面只提供画布高度与创建简历的动作。 -->
      <section class="h-[calc(100svh-168px)] min-h-[520px] rounded-xl border border-sf-b bg-sf-primary p-3">
        <AiGenerateFlow ref="flow" @confirm="handleConfirm" />
      </section>
    </main>
  </SfScrollbar>
</template>
