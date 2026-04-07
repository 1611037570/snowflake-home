<script setup>
import { useAiStore } from '@/stores'
import { storeToRefs } from 'pinia'
import ChatItem from './chatItem.vue'

const aiStore = useAiStore()
const { chatList, currentChatId, sidebarCollapsed } = storeToRefs(aiStore)
const { prepareNewChat, switchChat, delChat } = aiStore
</script>

<template>
  <div
    class="flex h-full shrink-0 flex-col border-r border-sf-border bg-sf-bg-2 transition-all duration-300"
    :class="[sidebarCollapsed ? 'w-0 overflow-hidden border-none opacity-0' : 'w-64 opacity-100']"
  >
    <!-- 侧边栏头部：新建对话 -->
    <div class="flex h-14 shrink-0 items-center justify-between border-b border-sf-border px-4">
      <span class="font-medium text-sf-text">历史记录</span>
      <SfTooltip content="新建对话">
        <div
          class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-sf-text-2 transition-colors hover:bg-sf-theme hover:text-white"
          @click="prepareNewChat"
        >
          <SfIcon icon="ph:plus-bold" size="4.5" />
        </div>
      </SfTooltip>
    </div>

    <!-- 会话列表 -->
    <div class="custom-scrollbar flex-1 overflow-y-auto scroll-smooth p-2">
      <div
        v-if="chatList.length === 0"
        class="flex flex-col items-center justify-center py-10 text-sf-text-3 opacity-60"
      >
        <SfIcon icon="ph:chats-teardrop-duotone" size="10" class="mb-2" />
        <span class="text-sm">暂无对话记录</span>
      </div>

      <div class="flex flex-col gap-1" v-else>
        <ChatItem
          v-for="chat in chatList"
          :key="chat.id"
          :chat="chat"
          :isActive="currentChatId === chat.id"
          @click="switchChat(chat.id)"
          @delete="delChat(chat.id)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 自定义细滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--color-sf-border);
  border-radius: 4px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: var(--color-sf-text-3);
}
</style>
