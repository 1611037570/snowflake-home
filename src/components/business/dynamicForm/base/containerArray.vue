<template>
  <VueDraggable
    v-model="form.list"
    :animation="150"
    class="m-0! w-full"
    :handle="'.' + getDragClass"
    :disabled="getDragDisabled"
    @end="onEnd"
  >
    <div v-for="(obj, i) in form.list" :key="obj.id" class="w-full" :class="getDragClass">
      <component
        :key="obj.id"
        :is="component"
        v-bind="dataProxy.getDataProxy(obj.data, i)"
        v-on="dataProxy.setDataProxy(obj.data, i)"
      ></component>
      <div class="flex">
        <el-button @click="moveUp(i)" :disabled="i === 0">上移</el-button>
        <el-button @click="moveDown(i)" :disabled="i === length - 1">下移</el-button>
        <el-button @click="add(i)">添加</el-button>
        <el-button @click="remove(i)">删除</el-button>
      </div>
    </div>
  </VueDraggable>
</template>

<script setup lang="ts">
import { getUUID } from '@/utils'
import { computed, inject, onMounted } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { getComponent } from '../components'

defineProps<{
  index?: number
}>()

function onEnd(data: any) {
  const { oldIndex, newIndex } = data
  if (oldIndex === newIndex) return
  dataProxy.move(form.value.list, oldIndex, newIndex)
}
const form = defineModel<any>('form')
const dataProxy = inject<any>('dataProxy')
// 是否禁用拖动
const getDragDisabled = computed(() => {
  return !form.value?.drag
})
// 拖动类名
const getDragClass = computed(() => {
  const dragClass = form.value?.dragClass
  return dragClass ? dragClass : 'sf-dynamic-form-array-drag'
})

onMounted(() => {
  if (form.value?.list) {
    form.value.list = form.value.list.map((item: any) => {
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

const length = computed(() => form.value?.list?.length || 0)
const component = getComponent(form.value?.component)

const moveUp = (index: number) => {
  if (index === 0) return
  const [item] = form.value.list.splice(index, 1)
  form.value.list.splice(index - 1, 0, item)
  dataProxy.move(form.value.list, index, index - 1)
}

const moveDown = (index: number) => {
  if (index === length.value - 1) return
  const [item] = form.value.list.splice(index, 1)
  form.value.list.splice(index + 1, 0, item)
  dataProxy.move(form.value.list, index, index + 1)
}

const remove = (index: number) => {
  dataProxy.remove(form.value.list, index)
  form.value.list.splice(index, 1)
}

const add = () => {}
</script>

<style scoped></style>
