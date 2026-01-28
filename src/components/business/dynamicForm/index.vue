<template>
  {{ configProxy }}
  <el-form ref="dynamicForm" :model="data" label-width="auto" style="max-width: 700px">
    <el-row :gutter="20" style="margin-right: 0; margin-left: 0">
      <el-col :span="item.span || 12" v-for="(item, index) in configProxy" :key="item.id || index">
        <ContainerObject v-if="item.type === 'object'" :config="item" />
        <ContainerArray v-else-if="item.type === 'array'" :config="item" />
      </el-col>
    </el-row>
  </el-form>
</template>
<script setup>
import { getCurrentInstance, onMounted, provide } from 'vue'
import ContainerArray from './base/containerArray.vue'
import ContainerObject from './base/containerObject.vue'

import DataProxy from './code/dataProxy'
import useConfigProxy from './code/useConfigProxy'
import { DEFAULT_CONFIG, DEFAULT_DATA } from './config'
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
onMounted(() => {
  setTimeout(() => {
    config.value.push({
      type: 'object',
      label: 'input',
      component: 'input',
      data: {
        key: ['name'],
        name: 'modelValue',
      },
    })
  }, 100)
})
</script>

<style scoped></style>
