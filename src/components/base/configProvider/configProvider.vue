<script setup>
import { DEFAULT_BACKGROUND, DEFAULT_COLOR } from '@/constants'
import { getElLocale } from '@/utils'

provide('bg', DEFAULT_BACKGROUND)
provide('color', DEFAULT_COLOR)

// 加载element-plus的locale
const locale = getElLocale.value

// https://cdn.jsdelivr.net/npm/pinyin@4.0.0/lib/umd/pinyin.min.js
// https://www.bootcdn.cn/
// https://www.jsdelivr.com/?query=vue
</script>

<template>
  <ElConfigProvider :locale="locale">
    <slot></slot>
  </ElConfigProvider>
</template>

<style lang="scss" scoped></style>
