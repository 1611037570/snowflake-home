<script setup>
import { useAiStore } from "@/stores";
import { storeToRefs } from "pinia";

const aiStore = useAiStore();
const { sidebarCollapsed } = storeToRefs(aiStore);
</script>

<template>
  <div
    class="border-sf-b relative flex h-full shrink-0 flex-col border-r bg-sf-bg-2 transition-all duration-300"
    :class="[sidebarCollapsed ? 'w-0 overflow-hidden border-none opacity-0' : 'w-64 opacity-100']"
  >
    <slot></slot>
  </div>
</template>
