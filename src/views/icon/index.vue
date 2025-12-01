<script setup>
import { DEFAULT_ICON } from '@/constants/icon'
const icons = Object.values(DEFAULT_ICON)
</script>

<template>
  <SfViewContainer>
    <h1 class="p-4 text-2xl font-bold">图标示例</h1>
    <div
      class="grid grid-cols-14 gap-4 rounded-xl bg-sf-bg p-3"
      style="backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px)"
    >
      <SfIcon
        v-for="item in icons"
        :key="item.icon"
        :icon="item.icon"
        class="rounded-xl bg-sf-primary text-sf-text transition-colors duration-300 group-hover:text-sf-primary"
        size="9"
        boxSize="12"
      />
    </div>
  </SfViewContainer>
</template>

<style lang="scss" scoped></style>
