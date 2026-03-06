<template>
  <el-form ref="dynamicForm" :model="data" label-width="auto" class="flex w-full flex-col">
    <FormRenderer v-model:items="form" />
  </el-form>
</template>
<script setup lang="ts">
import { getCurrentInstance, provide } from 'vue'
import FormRenderer from './base/formRenderer.vue'

import DataProxy from './code/dataProxy'
import useFormProxy from './code/useFormProxy'
import { DEFAULT_DATA, DEFAULT_FORM } from './config'

defineOptions({ name: 'SfDynamicForm' })
const props = withDefaults(
  defineProps<{
    components?: Record<string, any>
  }>(),
  {
    components: () => ({}),
  },
)

const instance = getCurrentInstance()
const emit = instance?.emit

const form = defineModel<any>('form', {
  default: DEFAULT_FORM,
})
const data = defineModel<any>('data', { default: DEFAULT_DATA })
const dataProxy = new DataProxy(data, emit)
const formProxy = useFormProxy(form)

// 注入实例自定义组件库
provide('instanceComponents', props.components || {})
// 注入数据代理和表单代理
provide('dataProxy', dataProxy)
provide('formProxy', formProxy)
</script>

<style scoped></style>
