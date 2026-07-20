<script setup>
import { DEFAULT_BACKGROUND, DEFAULT_COLOR } from '@/constants'
import { getElLocale } from '@/utils'

provide('bg', DEFAULT_BACKGROUND)
provide('color', DEFAULT_COLOR)
</script>

<template>
  <ElConfigProvider :locale="getElLocale">
    <slot></slot>
  </ElConfigProvider>
</template>

<style lang="scss" scoped></style>
