<template>
  <div v-for="(obj, i) in form.data" :key="i">
    <component
      :key="obj.id"
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
</template>

<script setup>
import { getUUID } from '@/utils'
import { computed, inject, onMounted } from 'vue'
import { getComponent } from '../components'

defineProps({
  index: {
    type: Number,
  },
})
const form = defineModel('form')
const dataProxy = inject('dataProxy')
onMounted(() => {
  form.value.data = form.value.data.map((item) => {
    if (!item?.id) {
      return {
        ...item,
        id: item.id || getUUID(),
      }
    }
    return item
  })
})
const length = computed(() => form.value.data.length)
const component = getComponent(form.value.component)
const moveUp = (index) => {
  if (index === 0) return
  const obj = form.value.data[index]
  form.value.data[index] = form.value.data[index - 1]
  form.value.data[index - 1] = obj
}
const moveDown = (index) => {
  if (index === length.value - 1) return
  const obj = form.value.data[index]
  form.value.data[index] = form.value.data[index + 1]
  form.value.data[index + 1] = obj
}
const remove = (index) => {
  form.value.data.splice(index, 1)
}
const add = (index) => {
  const newItem = JSON.parse(JSON.stringify(form.value.data[index]))
  newItem.id = getUUID()
  form.value.data.splice(index + 1, 0, newItem)
}
onMounted(() => {})
</script>

<style scoped></style>
