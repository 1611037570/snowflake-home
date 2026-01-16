<template>
  <el-form ref="dynamicForm" :model="data1" label-width="auto" style="max-width: 700px">
    <el-row :gutter="20" style="margin-right: 0; margin-left: 0">
      <el-col :span="item.span || 12" v-for="(item, index) in configProxy" :key="item.id || index">
        <Sortable :sortable="true" handle="handle">
          <ContainerObject v-if="item.type === 'object'" :config="item" />
          <ContainerArray v-else-if="item.type === 'array'" :config="item" />
        </Sortable>
      </el-col>
    </el-row>
  </el-form>
</template>
<script setup>
import { provide, onMounted } from 'vue'
import ContainerObject from './base/containerObject.vue'
import ContainerArray from './base/containerArray.vue'
import Sortable from './base/sortable.vue'

import DataProxy from './code/dataProxy'
import useConfigProxy from './code/useConfigProxy'
import { DEFAULT_CONFIG, DEFAULT_DATA } from './config'
// const instance = getCurrentInstance
// console.log('instance', getCurrentInstance)

// const { emit } = instance

const config = defineModel('config', {
  default: DEFAULT_CONFIG,
})
const data = defineModel('data', { default: DEFAULT_DATA })
const dataProxy = new DataProxy(data.value, '')
const configProxy = useConfigProxy(config)
provide('dataProxy', dataProxy)
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
