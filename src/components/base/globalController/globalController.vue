<script setup>
import { useSystemStore } from '@/stores'
const systemStore = useSystemStore()
const { monitorWatch } = storeToRefs(systemStore)
</script>

<template>
  <div>
    <!-- 监控器 -->
    <SfMonitor v-if="monitorWatch" />
  </div>
</template>

<style lang="scss" scoped></style>
