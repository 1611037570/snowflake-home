<script setup>
import { useAiStore } from '@/stores'
import { storeToRefs } from 'pinia'

const aiStore = useAiStore()
const { sidebarCollapsed } = storeToRefs(aiStore)
</script>

<template>
  <div
    class="absolute inset-y-0 left-0 z-50 flex h-full w-full flex-col border-r border-sf-border bg-sf-bg-2 shadow-2xl transition-all duration-300"
    :class="[
      sidebarCollapsed
        ? 'pointer-events-none -translate-x-full opacity-0'
        : 'translate-x-0 opacity-100',
    ]"
  >
    <slot></slot>
  </div>
</template>
