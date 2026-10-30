<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useStorage } from "@vueuse/core";
import { hasInterviewModel } from "@snowflake/interview-agent";
import type { InterviewConfig } from "@snowflake/interview-agent";
import InterviewButton from "./interviewButton.vue";
import { INTERVIEW_LANGUAGE_KEY } from "./config";

const visible = defineModel<boolean>({ default: false /* 默认关闭，由当前操作原地打开。 */ });
const emit = defineEmits<{
  ready: []; // 用户确认模型可用后，由调用页面继续原来的操作。
}>();
const modelReady = computed(() => hasInterviewModel());
// 语言属于可复用偏好，当前已开始的面试不随设置变化。
const language = useStorage<InterviewConfig["language"]>(INTERVIEW_LANGUAGE_KEY, "中文");
const languageOptions = ["中文", "英语"].map((value) => ({
  value, // 新面试采用的语言。
  name: value, // 设置中显示的语言名称。
}));
// 开始页与面试中复用同一个配置弹窗，配置模型时不离开或丢失当前内容。
const AiProviderSettingsContent = defineAsyncComponent(() => import("../editor/toolbar/modules/ai/content.vue"));
const confirm = () => {
  if (!modelReady.value) return;
  visible.value = false;
  emit("ready");
};
</script>

<template>
  <SfModal v-model="visible" :title="modelReady ? '面试设置' : '先配置面试模型'" width="1100px">
    <section class="flex w-full min-w-0 flex-col gap-3">
      <p class="text-xs leading-6 text-sf-text-2">为“面试官小羊”选择可用模型。设置在当前页面完成，已填写的资料、面试内容和回答草稿都会保留。</p>
      <label class="flex flex-wrap items-center gap-3 text-sm"><span>面试语言</span><SfSelect v-model="language" :list="languageOptions" class="max-w-48 rounded-xl! border border-sf-b bg-sf-bg" /><span class="text-xs text-sf-text-2">用于新开始的训练，当前面试保持原语言。</span></label>
      <SfScrollbar flush class="h-auto! flex-none!" max-height="60vh"><AiProviderSettingsContent /></SfScrollbar>
      <nav class="flex flex-wrap justify-end gap-3"><InterviewButton type="bg" @click="visible = false">返回</InterviewButton><InterviewButton :disabled="!modelReady" @click="confirm">配置完成，继续</InterviewButton></nav>
    </section>
  </SfModal>
</template>
