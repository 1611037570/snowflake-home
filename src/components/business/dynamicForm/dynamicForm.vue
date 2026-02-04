<template>
  {{ data }}
  <el-form
    ref="dynamicForm"
    :model="data"
    label-width="auto"
    style="max-width: 700px"
    class="flex flex-col"
  >
    <el-row
      :gutter="20"
      style="margin-right: 0; margin-left: 0"
      class="border border-solid border-gray-300"
    >
      <el-col
        class="w-full border border-red-400"
        :span="item.span || 12"
        v-for="(item, index) in formProxy"
        :key="item.id || index"
      >
        <FormItem v-if="checkForm(item)" :form="item" label-position="top">
          <ContainerObject v-if="item.type === 'object'" :form="item" />
          <ContainerArray v-else-if="item.type === 'array'" :form="item" />
        </FormItem>
        <template v-else> 数据错误：{{ item }} </template>
      </el-col>
    </el-row>
  </el-form>
</template>
<script setup>
import { getCurrentInstance, provide } from 'vue'
import ContainerArray from './base/containerArray.vue'
import ContainerObject from './base/containerObject.vue'
import FormItem from './base/formItem.vue'

import DataProxy from './code/dataProxy'
import useFormProxy from './code/useFormProxy'
import { DEFAULT_FORM, DEFAULT_DATA } from './config'

defineOptions({ name: 'SfDynamicForm' })
function checkObjectForm(form) {
  const { component, data } = form
  if (!component || !data) {
    return false
  }
  const { path, key } = data
  if (!path || !key) {
    return false
  }
  return true
}
function checkForm(form) {
  const { type } = form
  if (!type) {
    return false
  }
  if (type === 'object') {
    return checkObjectForm(form)
  }

  return true
}

const instance = getCurrentInstance()
const { emit } = instance

const form = defineModel('config', {
  default: DEFAULT_FORM,
})
const data = defineModel('data', { default: DEFAULT_DATA })
const dataProxy = new DataProxy(data, emit)

const formProxy = useFormProxy(form)
provide('dataProxy', dataProxy)
provide('formProxy', formProxy)
</script>

<style scoped></style>
