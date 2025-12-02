<script setup>
import { useWindowSize } from '@vueuse/core'
const { height } = useWindowSize()
const trigger = ref('hover')
const tooltipRef = useTemplateRef('tooltipRef')
function handleClick() {
  //   trigger.value = 'click'
  //   setTimeout(() => {
  //     trigger.value = 'hover'
  //   }, 1000)
  const res = tooltipRef.value.onClose()
  console.log('res', res)
}
</script>

<template>
  <ElBacktop :bottom="50" :right="50" :visibility-height="height">
    <SfTooltip
      content="回到顶部"
      @click="handleClick"
      :trigger="trigger"
      ref="tooltipRef"
      placement="bottom"
    >
      <SfIcon class="rounded-xl bg-sf-transparent" boxSize="10" size="8" icon="mingcute:up-line" />
    </SfTooltip>
  </ElBacktop>
</template>

<style lang="scss" scoped>
.el-backtop {
  background: none !important;
  box-shadow: none !important;
}
</style>
