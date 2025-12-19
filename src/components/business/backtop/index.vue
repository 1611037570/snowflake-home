<script setup>
import { useWindowSize } from '@vueuse/core'
const { height } = useWindowSize()
const trigger = ref('hover')
const tooltipRef = useTemplateRef('tooltipRef')
function handleClick() {
  tooltipRef.value.onClose()
}
</script>

<template>
  <ElBacktop
    :bottom="50"
    :right="50"
    :visibility-height="height - 50"
    style="z-index: 200"
    class="z-200"
  >
    <SfTooltip
      content="回到顶部"
      @click="handleClick"
      :trigger="trigger"
      ref="tooltipRef"
      placement="bottom"
    >
      <SfIcon
        class="z-200 rounded-xl bg-sf-transparent"
        boxSize="10"
        size="8"
        icon="mingcute:up-line"
      />
    </SfTooltip>
  </ElBacktop>
</template>

<style lang="scss" scoped>
.el-backtop {
  background: none !important;
  box-shadow: none !important;
}
</style>
