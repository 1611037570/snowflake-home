<script setup>
import { ref } from "vue";
import AiProviderSettingsContent from "../editor/toolbar/modules/ai/content.vue";

// 左侧菜单控制右侧 AI 配置内容。
const activePanel = ref("settings");
const panelList = [{ name: "AI设置", value: "settings", icon: "lucide:settings-2" }];
</script>

<template>
  <div class="flex h-full w-full">
    <aside class="flex w-48 shrink-0 flex-col border-r border-sf-b bg-sf-primary p-3">
      <button
        v-for="panel in panelList"
        :key="panel.value"
        class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition-colors"
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
    <section class="min-w-0 flex-1 p-6">
      <AiProviderSettingsContent v-if="activePanel === 'settings'" class="h-full" />
    </section>
  </div>
</template>
