<script setup>
import { useSystemStore } from '@/stores'
import { storeToRefs } from 'pinia'
const systemStore = useSystemStore()
const { windowSize } = storeToRefs(systemStore)

defineOptions({ name: 'SfBacktop' })

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
    :visibility-height="windowSize.height - 50"
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
        class="z-200 rounded-xl bg-sf-theme-hover"
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
