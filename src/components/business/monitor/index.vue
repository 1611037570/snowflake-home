<script setup lang="ts">
import { useFps } from '@/hooks'
const { fps } = useFps()
</script>

<template>
  <div class="fixed top-0 right-0 z-9999 bg-sf-theme p-3">fps：{{ fps }}</div>
</template>
<style lang="scss" scoped></style>
