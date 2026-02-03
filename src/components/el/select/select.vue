<template>
  <Component
    v-model="value"
    :is="h(ElSelect, { ...$attrs, ref: changeRef }, $slots)"
    class="rounded-b-md text-sf-base"
    :class="bg"
  >
    <ElOption v-for="item in list" :key="item.value" :label="item.name" :value="item.value" />
  </Component>
</template>

<script setup lang="ts">
import { ElSelect } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { getCurrentInstance, h } from 'vue'

defineOptions({ name: 'SfSelect' })

const bg = inject('bg')

defineProps({
  list: {
    type: Array,
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

<style scoped></style>
