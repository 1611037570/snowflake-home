<script setup>
import { DEFAULT_BACKGROUND, DEFAULT_COLOR } from '@/constants'
import { getElLocale } from '@/utils'

provide('bg', DEFAULT_BACKGROUND)
provide('color', DEFAULT_COLOR)

// https://cdn.jsdelivr.net/npm/pinyin@4.0.0/lib/umd/pinyin.min.js
// https://www.bootcdn.cn/
// https://www.jsdelivr.com/?query=vue
</script>

<template>
  <ElConfigProvider :locale="getElLocale">
    <slot></slot>
  </ElConfigProvider>
</template>

<style lang="scss" scoped></style>
