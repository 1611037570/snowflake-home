<script setup>
import { ALL_CONTENT, ALL_PAGE, ICON_LIST } from '@/constants'
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
// 文案长度
const contentLength = ALL_CONTENT.length

const data = {
  title: {
    text: '基建产物',
  },
  xAxis: {
    type: 'category',
    data: ['基建类型'],
  },
  // 仅补充必须的Y轴（避免报错，无额外配置）
  yAxis: {
    type: 'value',
  },
  // 核心改造：拆分为4个独立的series，无新增配置
  series: [
    {
      type: 'bar',
      name: '内容',
      data: [contentLength], // 仅对应X轴第一个类目“内容”，无空数据
      xAxisIndex: 0, // 指定对应主X轴（默认0，可省略，仅标注）
    },
    {
      type: 'bar',
      name: '页面',
      data: [viewLength], // 仅对应X轴第二个类目“页面”
      xAxisIndex: 0,
    },
    {
      type: 'bar',
      name: '组件',
      data: [componentLength], // 仅对应X轴第三个类目“组件”
      xAxisIndex: 0,
    },
    {
      type: 'bar',
      name: '图标',
      data: [iconLength], // 仅对应X轴第四个类目“图标”
      xAxisIndex: 0,
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
