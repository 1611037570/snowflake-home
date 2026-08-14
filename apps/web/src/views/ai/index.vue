<script setup>
import { useAiStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref, watch } from "vue";
import Chat from "./chat/index.vue";
import ChatList from "./chatlist/chatList.vue";
import SettingsDrawer from "./chatlist/settingsDrawer.vue";

const aiStore = useAiStore();
const { sidebarCollapsed, sidebarMode, currentChat, currentChatId, chatList } =
  storeToRefs(aiStore);
const { prepareNewChat, createChat } = aiStore;

// 临时 chat 引用：当 currentChat 不存在时使用
const pendingChat = ref(createChat());

// 实际传给子组件的 chat：优先使用 store 的 currentChat，否则用 pendingChat
const chatProp = computed(() => currentChat.value || pendingChat.value);

// 监听：当用户在临时 chat 中发送了消息（messages 超过 1 条即含 system+用户消息），将其持久化到 store
watch(
  () => chatProp.value?.messages?.length ?? 0,
  (len) => {
    if (chatProp.value === pendingChat.value && len > 1) {
      // 将临时 chat 加入 chatList，并设置为当前对话
      chatList.value.unshift(pendingChat.value);
      currentChatId.value = pendingChat.value.id;
      // 准备下一个空的临时 chat 以供下次新建对话
      pendingChat.value = createChat();
    }
  },
);

/**
 * 切换侧边栏模式
 */
const toggleSidebarMode = () => {
  sidebarMode.value = sidebarMode.value === "dock" ? "float" : "dock";
};

// 设置弹窗状态
const showSettings = ref(false);

// 每次挂载时重置当前会话 ID，回到初始欢迎状态
onMounted(() => {
  currentChatId.value = "";
});
</script>

<template>
  <div class="relative flex h-full w-full bg-sf-bg">
    <!-- 侧边栏 -->
    <ChatList />
    <!-- 主聊天区域 -->
    <div class="relative flex h-full flex-1 flex-col overflow-hidden bg-sf-bg">
      <!-- 头部区域 -->
      <div
        class="z-10 grid h-14 w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-sf-border/50 bg-sf-bg/80 px-3 backdrop-blur-md"
      >
        <!-- 左侧操作区 -->
        <div class="flex items-center gap-2">
          <!-- 侧边栏折叠按钮 -->
          <SfTooltip :content="sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'">
            <div
              class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-sf-text-2 transition-colors duration-300 hover:bg-sf-bg-3 hover:text-sf-text"
              @click="sidebarCollapsed = !sidebarCollapsed"
            >
              <SfIcon icon="ph:list-duotone" size="4.5" />
            </div>
          </SfTooltip>

          <!-- 侧边栏模式切换按钮 -->
          <SfTooltip :content="sidebarMode === 'dock' ? '切换为浮动模式' : '切换为固定模式'">
            <div
              class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-sf-text-2 transition-colors duration-300 hover:bg-sf-bg-3 hover:text-sf-text"
              @click="toggleSidebarMode"
            >
              <SfIcon
                :icon="sidebarMode === 'dock' ? 'ph:push-pin-light' : 'ph:push-pin-fill'"
                size="4"
              />
            </div>
          </SfTooltip>

          <!-- 新建对话按钮 (左侧第二个) -->
          <SfTooltip content="新建对话">
            <div
              class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-sf-text-2 transition-colors duration-300 hover:bg-sf-bg-3 hover:text-sf-text"
              @click="prepareNewChat"
            >
              <SfIcon icon="ph:plus-bold" size="4" />
            </div>
          </SfTooltip>
        </div>

        <!-- 中间标题 (居中且自动适应剩余宽度) -->
        <div class="flex min-w-0 items-center justify-center gap-2 px-4">
          <span class="truncate font-medium tracking-wide text-sf-text">
            {{ currentChat?.title || "新对话" }}
          </span>
        </div>

        <!-- 右侧操作区 -->
        <div class="flex items-center justify-end gap-2">
          <SfTooltip content="设置">
            <div
              class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-sf-text-3 transition-colors duration-300 hover:bg-sf-bg-3 hover:text-sf-text"
              @click="showSettings = true"
            >
              <SfIcon icon="ph:gear-duotone" size="4.5" />
            </div>
          </SfTooltip>
        </div>
      </div>

      <!-- 独立抽离的聊天窗口组件 -->
      <div class="relative h-full flex-1 overflow-hidden">
        <Chat v-model:chat="chatProp" :key="chatProp.id" />
      </div>
    </div>
  </div>

  <!-- 对话设置侧边栏抽离为独立组件 -->
  <SettingsDrawer v-model="showSettings" />
</template>

<style lang="scss" scoped></style>
