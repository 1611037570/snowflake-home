<script setup>
import { ref } from "vue";
import AiProviderSettingsContent from "../editor/toolbar/modules/ai/content.vue";
import ConversationViewer from "./components/conversationViewer.vue";

// 左侧菜单控制右侧内容。
const activePanel = ref("settings");
const panelList = [
  { name: "消息", value: "messages", icon: "ph:chats-duotone" },
  { name: "AI设置", value: "settings", icon: "lucide:settings-2" },
];
</script>

<template>
  <div class="flex h-full w-full flex-col md:flex-row">
    <aside class="flex shrink-0 flex-row gap-3 overflow-x-auto border-b border-sf-b bg-sf-primary p-3 md:w-48 md:flex-col md:border-r md:border-b-0">
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
        {{ panel.name }}
      </button>
    </aside>
    <section class="min-h-0 min-w-0 flex-1 p-3 sm:p-6">
      <ConversationViewer v-if="activePanel === 'messages'" class="h-full" />
      <AiProviderSettingsContent v-if="activePanel === 'settings'" class="h-full" />
    </section>
  </div>
</template>
