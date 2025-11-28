<template>
  <div class="">
    <ElTooltip :effect="themeMode" :content="content" placement="top">
      <slot>
        <BaseIcon icon="mingcute:question-line" size="4" />
      </slot>
    </ElTooltip>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores'
const themeStore = useThemeStore()
const { themeMode } = storeToRefs(themeStore)

defineProps({
  content: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss" scoped></style>
