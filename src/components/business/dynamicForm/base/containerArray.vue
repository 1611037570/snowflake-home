<template>
  <el-row class="m-0! w-full" :gutter="12" ref="row" v-if="form.list.length">
    <FormItem
      :form="item"
      v-for="(item, index) in form.list"
      :span="item.span"
      :key="item.id"
      class="p-0!"
    >
      <component
        :key="item.id"
        :is="getComponent(item?.component)"
        v-bind="{
          ...dataProxy.getDataProxy(item.data, index),
          ...item.props,
        }"
        v-on="dataProxy.setDataProxy(item.data, index)"
      ></component>
      <div class="flex" v-if="item.ui">
        <el-button @click="moveUp(index)" :disabled="index === 0">上移</el-button>
        <el-button @click="moveDown(index)" :disabled="index === length - 1">下移</el-button>
        <el-button @click="add(index)">添加</el-button>
        <el-button @click="remove(index)">删除</el-button>
      </div>
    </FormItem>
  </el-row>
</template>

<script setup lang="ts">
import { getUUID } from '@/utils'
import { computed, inject, onMounted } from 'vue'
import { useDraggable } from 'vue-draggable-plus'
import { getComponent } from '../components'
import FormItem from './formItem.vue'
const row: any = useTemplateRef('row')

defineProps<{
  index?: number
}>()

const form = defineModel<any>('form')

const dataProxy = inject<any>('dataProxy')

useDraggable(row, form.value.list, {
  handle: form.value?.dragClass || '',
  animation: 150,
  ghostClass: 'ghost',
  disabled: !form.value?.drag,
  onEnd(data: any) {
    const { oldIndex, newIndex } = data
    console.log('oldIndex:>> ', oldIndex)
    console.log('newIndex:>> ', newIndex)
    if (oldIndex === newIndex) return
    const [item] = form.value.list.splice(oldIndex, 1)
    form.value.list.splice(newIndex, 0, item)
    dataProxy.move(form.value.list, oldIndex, newIndex)
  },
})
onMounted(() => {
  if (form.value?.list) {
    form.value.list = form.value.list.map((item: any) => {
      return {
        ...item,
        id: item.id || getUUID(),
      }
    })
  }
})

const length = computed(() => form.value?.list?.length || 0)

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
  console.log('orm.value.list:>> ', form.value.list)

  dataProxy.remove(form.value.list, index)
  form.value.list.splice(index, 1)
}

const add = () => {}
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
