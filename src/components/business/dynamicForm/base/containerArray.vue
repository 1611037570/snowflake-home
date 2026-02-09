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

<script setup lang="ts">
import { getUUID } from '@/utils'
import { computed, inject, onMounted } from 'vue'
import { getComponent } from '../components'

defineProps<{
  index?: number
}>()

const form = defineModel<any>('form')
const dataProxy = inject<any>('dataProxy')

onMounted(() => {
  if (form.value?.data) {
    form.value.data = form.value.data.map((item: any) => {
      if (!item?.id) {
        return {
          ...item,
          id: item.id || getUUID(),
        }
      }
      return item
    })
  }
})

const length = computed(() => form.value?.data?.length || 0)
const component = getComponent(form.value?.component)

const moveUp = (index: number) => {
  if (index === 0) return
  const obj = form.value.data[index]
  form.value.data[index] = form.value.data[index - 1]
  form.value.data[index - 1] = obj
}

const moveDown = (index: number) => {
  if (index === length.value - 1) return
  const obj = form.value.data[index]
  form.value.data[index] = form.value.data[index + 1]
  form.value.data[index + 1] = obj
}

const remove = (index: number) => {
  form.value.data.splice(index, 1)
}

const add = (index: number) => {
  const newItem = JSON.parse(JSON.stringify(form.value.data[index]))
  newItem.id = getUUID()
  form.value.data.splice(index + 1, 0, newItem)
}
</script>

<style scoped></style>
