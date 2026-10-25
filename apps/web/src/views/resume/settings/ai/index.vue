<script setup>
import { ref } from "vue";
import AiProviderSettingsContent from "../../editor/toolbar/modules/ai/content.vue";
import ConversationViewer from "./components/conversationViewer.vue";

// 左侧菜单控制右侧内容。
const activePanel = ref("settings");
const panelList = [
  // { nameKey: "resumeAiMessages", value: "messages", icon: "ph:chats-duotone" },
  { nameKey: "resumeAiSettings", value: "settings", icon: "lucide:settings-2" },
];

// 页面可见能力词与真实助手功能保持一致，帮助用户理解模型配置后的用途。
const seoFeatureKeys = [
  "resumeAiSeoFeatureGenerate",
  "resumeAiSeoFeaturePolish",
  "resumeAiSeoFeatureMatch",
  "resumeAiSeoFeatureReview",
  "resumeAiSeoFeatureInterview",
];
</script>

<template>
  <div class="flex h-full w-full flex-col bg-sf-primary md:flex-row">
    <aside
      class="flex shrink-0 flex-row gap-3 overflow-x-auto border-b border-sf-b bg-sf-primary p-3 md:w-48 md:flex-col md:border-r md:border-b-0"
    >
      <button
        v-for="panel in panelList"
        :key="panel.value"
        class="flex shrink-0 cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition-colors"
        :class="
          activePanel === panel.value
            ? 'bg-sf-theme-3 text-sf-theme'
            : 'text-sf-text-2 hover:bg-sf-bg hover:text-sf-text'
        "
        type="button"
        @click="activePanel = panel.value"
      >
        <SfIcon :icon="panel.icon" size="4" />
        {{ $t(panel.nameKey) }}
      </button>
    </aside>
    <section class="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-3">
      <header class="shrink-0 rounded-3xl border border-sf-b bg-sf-transparent p-3">
        <p class="text-sm font-semibold text-sf-theme">{{ $t("resumeAiSeoEyebrow") }}</p>
        <h1 class="mt-3 text-2xl font-black tracking-[-0.03em] text-sf-text">
          {{ $t("resumeAiSeoTitle") }}
        </h1>
        <p class="mt-3 max-w-4xl text-sm leading-6 text-sf-text-2">
          {{ $t("resumeAiSeoDescription") }}
        </p>
        <ul class="mt-3 flex flex-wrap gap-3">
          <li
            v-for="featureKey in seoFeatureKeys"
            :key="featureKey"
            class="rounded-full bg-sf-bg px-3 py-1 text-xs font-medium text-sf-text-2"
          >
            {{ $t(featureKey) }}
          </li>
        </ul>
      </header>
      <ConversationViewer v-if="activePanel === 'messages'" class="min-h-0 flex-1" />
      <AiProviderSettingsContent v-if="activePanel === 'settings'" class="min-h-0 flex-1" />
    </section>
  </div>
</template>
