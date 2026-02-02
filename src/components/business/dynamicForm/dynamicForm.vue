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
        v-for="(item, index) in configProxy"
        :key="item.id || index"
      >
        <FormItem v-if="checkConfig(item)" :config="item" label-position="top">
          <ContainerObject v-if="item.type === 'object'" :config="item" />
          <ContainerArray v-else-if="item.type === 'array'" :config="item" />
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
import useConfigProxy from './code/useConfigProxy'
import { DEFAULT_CONFIG, DEFAULT_DATA } from './config'

defineOptions({ name: 'SfDynamicForm' })
function checkObjectConfig(config) {
  const { component, data } = config
  if (!component || !data) {
    return false
  }
  const { path, key } = data
  if (!path || !key) {
    return false
  }
  return true
}
function checkConfig(config) {
  const { type } = config
  if (!type) {
    return false
  }
  if (type === 'object') {
    return checkObjectConfig(config)
  }

  return true
}

const instance = getCurrentInstance()
const { emit } = instance

const config = defineModel('config', {
  default: DEFAULT_CONFIG,
})
const data = defineModel('data', { default: DEFAULT_DATA })
const dataProxy = new DataProxy(data, emit)

const configProxy = useConfigProxy(config)
provide('dataProxy', dataProxy)
provide('configProxy', configProxy)
</script>

<style scoped></style>
