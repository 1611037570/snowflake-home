<script setup>
import { ALL_PAGE, ICON_LIST } from '@/constants'
const iconLength = Object.keys(ICON_LIST).length
// 所有视图组件
const viewLength = ALL_PAGE.value.length
// 所有基础组件
const baseComponent = import.meta.glob('@/components/base/*/index.vue', { eager: false })
const baseComponentLength = Object.keys(baseComponent).length
// 所有业务组件
const businessComponent = import.meta.glob('@/components/business/*/index.vue', { eager: false })
const businessComponentLength = Object.keys(businessComponent).length
// 所有组件
const componentLength = baseComponentLength + businessComponentLength

const data = {
  title: {
    text: '基建产物',
  },
  xAxis: {
    type: 'category',
    data: ['页面', '组件', '图标'],
  },
  series: [
    {
      type: 'bar',
      data: [viewLength, componentLength, iconLength],
    },
  ],
}
</script>

<template>
  <SfViewContainer>
    <SfEcharts :options="data"></SfEcharts>
  </SfViewContainer>
</template>

<style lang="scss" scoped></style>
