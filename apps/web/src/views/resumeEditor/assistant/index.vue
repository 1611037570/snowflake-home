<script setup>
import { computed } from "vue";
import { useAiStore, useResumeStore } from "@/stores";
import {
  ALL_MODULE_KEY,
  ALL_MODULE_NAME,
  DEFAULT_EDITOR,
} from "@/stores/modules/resume/defaultConfig";
import { storeToRefs } from "pinia";
import { flows, suggestions } from "./flows";
import { useResumeAssistant } from "./useResumeAssistant";

const Chat = defineAsyncComponent(() => import("./chat/index.vue"));

// AI 对话
const aiStore = useAiStore();
const resumeStore = useResumeStore();
// 组装简历域技能、工具与对话创建方法，入口不再直接拼接系统消息
const { config: assistantConfig, createChat: createAssistantChat } = useResumeAssistant(
  resumeStore.applyAiDataPatch,
  resumeStore.addDataRecord,
);
const { resumeAssistantChat } = storeToRefs(aiStore);
const { system, selectedModule } = storeToRefs(resumeStore);
// 当前操作模块列表：有选中模块时展示真实模块，无选中时补“整个简历”兜底项
const selectedModules = computed(() =>
  selectedModule.value.length
    ? selectedModule.value
    : [{ key: ALL_MODULE_KEY, name: ALL_MODULE_NAME }],
);
// 点击模块标签右上角关闭按钮时取消选中，统一走 store 操作
const removeSelectedModule = (key) => {
  resumeStore.unselectModule(key);
};
// AI助手区域宽度：读取编辑器配置，默认 400px
const assistantWidth = DEFAULT_EDITOR.assistantWidth;

// 简历助手对话：ai store 已持久化，无缓存时初始化默认对话
if (!resumeAssistantChat.value) {
  resumeAssistantChat.value = createAssistantChat();
}
const chat = resumeAssistantChat;

function createNewChat() {
  chat.value = createAssistantChat();
}
</script>

<template>
  <div class="box-border h-full py-3" :style="{ width: assistantWidth + 'px' }">
    <div
      class="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-sf-b bg-sf-primary hover:border-sf-theme-2"
    >
      <!-- 顶部操作栏 -->
      <div
        class="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full border border-sf-b bg-sf-page p-2 transition-all duration-200 select-none"
        :class="
          system.toolbarAlwaysVisible
            ? 'translate-y-0 opacity-100'
            : '-translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
        "
      >
        <SfTooltip content="新建话题">
          <SfIcon
            @click="createNewChat"
            icon="ph:plus-bold"
            size="5"
            boxSize="7"
            class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
          />
        </SfTooltip>
      </div>
      <Chat
        :chat="chat"
        :config="assistantConfig"
        :flows="flows"
        :suggestions="suggestions"
        :selected-modules="selectedModules"
        :remove-module="removeSelectedModule"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
