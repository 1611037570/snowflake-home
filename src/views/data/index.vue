<script setup>
import { ICON_LIST } from '@/constants'
const iconLength = Object.keys(ICON_LIST).length
// 所有视图组件
const view = import.meta.glob('@/views/*/index.vue', { eager: false })
const viewLength = Object.keys(view).length
// 所有基础组件
const baseComponent = import.meta.glob('@/components/base/*/index.vue', { eager: false })
const baseComponentLength = Object.keys(baseComponent).length
// 所有业务组件
const businessComponent = import.meta.glob('@/components/business/*/index.vue', { eager: false })
const businessComponentLength = Object.keys(businessComponent).length
// 所有组件
const componentLength = baseComponentLength + businessComponentLength
</script>

<template>
  <SfViewContainer>
    已加载 {{ viewLength }} 个视图, {{ componentLength }} 个组件, {{ iconLength }} 个图标
  </SfViewContainer>
</template>

<style lang="scss" scoped></style>
