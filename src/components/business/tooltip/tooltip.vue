<template>
  <div class="">
    <Component
      :effect="theme"
      :is="h(ElTooltip, { placement: 'top', ...$attrs, ref: changeRef }, $slots)"
    >
      <template #default>
        <slot>
          <SfIcon icon="mingcute:question-line" size="4" />
        </slot>
      </template>
      <template #content>
        <slot name="content"> </slot>
      </template>
    </Component>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { ElTooltip } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { getCurrentInstance, h } from 'vue'

defineOptions({ name: 'SfTooltip' })

const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)

const vm: any = getCurrentInstance()

function changeRef(exports: any) {
  vm.exposed = exports
}
defineExpose({} as ComponentInstance<typeof ElTooltip>)
</script>

<style lang="scss" scoped></style>
