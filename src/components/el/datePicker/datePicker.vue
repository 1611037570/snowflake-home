<template>
  <Component
    v-model="value"
    :is="h(ElDatePicker, { ...$attrs, ref: changeRef }, $slots)"
    class="w-full rounded-xl border-none bg-sf-primary text-sf-text"
  />
</template>

<script setup lang="ts">
import { ElDatePicker } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { getCurrentInstance, h } from 'vue'

defineOptions({ name: 'SfDatePicker' })

const vm: any = getCurrentInstance()
const value = defineModel('modelValue')
function changeRef(exports: any) {
  vm.exposed = exports
}
defineExpose({} as ComponentInstance<typeof ElDatePicker>)
</script>
