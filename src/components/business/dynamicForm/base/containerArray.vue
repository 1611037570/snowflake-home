<template>
  <FormItem :config="config">
    <div v-for="(obj, i) in config.data" :key="i">
      <component
        :is="component"
        v-bind="dataProxy.getDataProxy(obj)"
        v-on="dataProxy.setDataProxy(obj)"
      ></component>
      <div class="flex">
        <el-button @click="moveUp(i)">上移</el-button>
        <el-button @click="moveDown(i)">下移</el-button>
        <el-button @click="add(i)">添加</el-button>
        <el-button @click="remove(i)">删除</el-button>
      </div>
    </div>
  </FormItem>
</template>

<script setup>
import { inject, onMounted } from 'vue'
import { getComponent } from '../components'
import FormItem from './formItem.vue'

const { config } = defineProps({
  index: {
    type: Number,
  },
  config: {
    type: Object,
  },
})
const dataProxy = inject('dataProxy')

const component = getComponent(config.component)
const moveUp = (index) => {
  console.log('moveUp', index)
}
const moveDown = (index) => {
  console.log('moveDown', index)
}
const remove = (index) => {
  console.log('remove', index)
}
onMounted(() => {})
</script>

<style scoped></style>
