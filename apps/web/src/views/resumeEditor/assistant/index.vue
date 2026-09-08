<script setup>
import { computed } from "vue";
import { useAiStore, useResumeStore } from "@/stores";
import { ALL_MODULE_KEY, ALL_MODULE_NAME } from "@/stores/modules/resume/defaultConfig";
import { storeToRefs } from "pinia";
import { flows, suggestions } from "./flows";
import { useResumeAssistant } from "./useResumeAssistant";

const Chat = defineAsyncComponent(() => import("./chat/index.vue"));

// AI 对话
const aiStore = useAiStore();
const resumeStore = useResumeStore();
// 组装简历域技能、工具与对话创建方法，入口不再直接拼接系统消息
const { config: assistantConfig, createChat: createAssistantChat } = useResumeAssistant(
  resumeStore.addDataRecord,
);
// 把会话工厂注册到 ai store，header 等入口可直接从 pinia 调用新建话题
aiStore.registerResumeAssistantChatFactory(createAssistantChat);
const { resumeAssistantChat } = storeToRefs(aiStore);
const { selectedModule, assistantWidth } = storeToRefs(resumeStore);
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
// 简历助手对话：ai store 已持久化，无缓存时初始化默认对话
if (!resumeAssistantChat.value) {
  resumeAssistantChat.value = createAssistantChat();
}
const chat = resumeAssistantChat;
</script>

<template>
  <SfResizable
    v-model:size="assistantWidth"
    :min="400"
    :max="500"
    position="left"
    class="box-border h-full py-3"
  >
    <div
      class="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-sf-b bg-sf-primary"
    >
      <Chat
        :chat="chat"
        :config="assistantConfig"
        :flows="flows"
        :suggestions="suggestions"
        :selected-modules="selectedModules"
        :remove-module="removeSelectedModule"
      />
    </div>
  </SfResizable>
</template>

<style lang="scss" scoped></style>
