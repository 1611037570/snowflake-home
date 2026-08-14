<script setup>
import { useAiStore } from "@/stores";
import { storeToRefs } from "pinia";
import ChatListContent from "./ChatListContent.vue";
import SidebarDock from "./SidebarDock.vue";
import SidebarFloat from "./SidebarFloat.vue";

const aiStore = useAiStore();
const { sidebarMode } = storeToRefs(aiStore);
</script>

<template>
  <!-- 固定模式 -->
  <SidebarDock v-if="sidebarMode === 'dock'">
    <ChatListContent />
  </SidebarDock>

  <!-- 浮动模式 -->
  <div v-else class="w-0 shrink-0">
    <SidebarFloat>
      <ChatListContent />
    </SidebarFloat>
  </div>
</template>

<style lang="scss" scoped></style>
