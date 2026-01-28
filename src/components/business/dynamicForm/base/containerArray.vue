<template>
  <FormItem :config="config">
    <div v-for="(obj, i) in config.data" :key="i">
      <component
        :is="component"
        v-bind="dataProxy.getDataProxy(obj, i)"
        v-on="dataProxy.setDataProxy(obj, i)"
      ></component>
      <div class="flex">
        <el-button @click="moveUp(i)" :disabled="i === 0">上移</el-button>
        <el-button @click="moveDown(i)" :disabled="i === length - 1">下移</el-button>
        <el-button @click="add(i)">添加</el-button>
        <el-button @click="remove(i)">删除</el-button>
      </div>
    </div>
  </FormItem>
</template>

<script setup>
import { computed, inject, onMounted } from 'vue'
import { getComponent } from '../components'
import FormItem from './formItem.vue'

defineProps({
  index: {
    type: Number,
  },
})
const config = defineModel('config')
const dataProxy = inject('dataProxy')

const length = computed(() => config.value.data.length)
const component = getComponent(config.value.component)
const moveUp = (index) => {
  if (index === 0) return
  const obj = config.value.data[index]
  config.value.data[index] = config.value.data[index - 1]
  config.value.data[index - 1] = obj
}
const moveDown = (index) => {
  if (index === length.value - 1) return
  const obj = config.value.data[index]
  config.value.data[index] = config.value.data[index + 1]
  config.value.data[index + 1] = obj
}
const remove = (index) => {
  config.value.data.splice(index, 1)
}
const add = (index) => {
  const newItem = JSON.parse(JSON.stringify(config.value.data[index]))
  config.value.data.splice(index + 1, 0, newItem)
}
onMounted(() => {})
</script>

<style scoped></style>
