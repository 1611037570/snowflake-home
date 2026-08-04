<template>
  <Component
    v-model="value"
    :is="h(ElSelect, { ...$attrs, ref: changeRef }, $slots)"
    class="text-sf-base"
    :class="bg"
  >
    <ElOption v-for="item in list" :key="item.value" :label="item.name" :value="item.value" />
  </Component>
</template>

<script setup lang="ts">
import { ElSelect } from 'element-plus'
import type { ComponentInstance, PropType } from 'vue'
import { getCurrentInstance, h } from 'vue'

defineOptions({ name: 'SfSelect' })

const bg = inject('bg')

defineProps({
  list: {
    type: Array as PropType<{ value: string; name: string }[]>,
    default: () => [],
  },
})
const value = defineModel('modelValue')

const vm: any = getCurrentInstance()

function changeRef(exports: any) {
  vm.exposed = exports
}
defineExpose({} as ComponentInstance<typeof ElSelect>)
</script>

<style scoped lang="scss">
:deep(.el-select__wrapper) {
  /* 移除阴影 */
  box-shadow: none;
  /* 移除背景 */
  background-color: transparent;
}
</style>
