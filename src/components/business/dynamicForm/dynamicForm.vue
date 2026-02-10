<template>
  <el-form
    ref="dynamicForm"
    :model="data"
    label-width="auto"
    style="max-width: 700px"
    class="flex w-full flex-col p-3"
  >
    <FormRenderer v-model:items="formProxy" :draggable="draggable" />
  </el-form>
</template>
<script setup lang="ts">
import { getCurrentInstance, provide } from 'vue'
import FormRenderer from './base/formRenderer.vue'

import DataProxy from './code/dataProxy'
import useFormProxy from './code/useFormProxy'
import { DEFAULT_DATA, DEFAULT_FORM } from './config'

defineOptions({ name: 'SfDynamicForm' })

withDefaults(
  defineProps<{
    draggable?: boolean
  }>(),
  {
    draggable: false,
  },
)

const instance = getCurrentInstance()
const emit = instance?.emit

const form = defineModel<any[]>('form', {
  default: DEFAULT_FORM,
})
const data = defineModel<any>('data', { default: DEFAULT_DATA })
const dataProxy = new DataProxy(data, emit)

const formProxy = useFormProxy(form)
provide('dataProxy', dataProxy)
provide('formProxy', formProxy)
</script>

<style scoped></style>
