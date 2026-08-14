<script setup>
import { useAiStore } from "@/stores";
import { storeToRefs } from "pinia";
import ChatItem from "./chatItem.vue";

const aiStore = useAiStore();
const { chatList, currentChatId, sidebarCollapsed, sidebarMode } = storeToRefs(aiStore);
const { prepareNewChat, switchChat, delChat } = aiStore;

/**
 * 处理新建对话
 */
const handlePrepareNewChat = () => {
  prepareNewChat();
  // 浮动模式下，点击新建后自动折叠
  if (sidebarMode.value === "float") {
    sidebarCollapsed.value = true;
  }
};

/**
 * 处理切换对话
 */
const handleSwitchChat = (id) => {
  switchChat(id);
  // 浮动模式下，切换后自动折叠
  if (sidebarMode.value === "float") {
    sidebarCollapsed.value = true;
  }
};

/**
 * 切换侧边栏模式
 */
const toggleSidebarMode = () => {
  sidebarMode.value = sidebarMode.value === "dock" ? "float" : "dock";
};
</script>

<template>
  <!-- 侧边栏头部：新建对话 -->
  <div class="flex h-14 shrink-0 items-center justify-between border-b border-sf-border px-4">
    <div class="flex items-center gap-2">
      <!-- 折叠按钮（浮动模式下显示） -->
      <div
        v-if="sidebarMode === 'float'"
        class="mr-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded text-sf-text-2 transition-colors hover:bg-sf-bg-3 hover:text-sf-text"
        @click="sidebarCollapsed = true"
      >
        <SfIcon icon="ph:list-duotone" size="4" />
      </div>
      <span class="font-medium text-sf-text">历史记录</span>
      <!-- 切换模式按钮 -->
      <SfTooltip :content="sidebarMode === 'dock' ? '切换为浮动模式' : '切换为固定模式'">
        <div
          class="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-sf-text-3 transition-colors hover:bg-sf-bg-3 hover:text-sf-text"
          @click="toggleSidebarMode"
        >
          <SfIcon
            :icon="sidebarMode === 'dock' ? 'ph:push-pin-light' : 'ph:push-pin-fill'"
            size="3.5"
          />
        </div>
      </SfTooltip>
    </div>
    <SfTooltip content="新建对话">
      <div
        class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-sf-text-2 transition-colors hover:bg-sf-theme hover:text-white"
        @click="handlePrepareNewChat"
      >
        <SfIcon icon="ph:plus-bold" size="4.5" />
      </div>
    </SfTooltip>
  </div>

  <!-- 会话列表 -->
  <SfScrollbar class="flex-1 p-2">
    <div
      v-if="chatList.length === 0"
      class="flex flex-col items-center justify-center py-10 text-sf-text-3 opacity-60"
    >
      <SfIcon icon="ph:chats-teardrop-duotone" size="10" class="mb-2" />
      <span class="text-sm">暂无对话记录</span>
    </div>

    <div v-else class="flex flex-col gap-1">
      <ChatItem
        v-for="chat in chatList"
        :key="chat.id"
        :chat="chat"
        :isActive="currentChatId === chat.id"
        @click="handleSwitchChat(chat.id)"
        @delete="delChat(chat.id)"
      />
    </div>
  </SfScrollbar>
</template>
