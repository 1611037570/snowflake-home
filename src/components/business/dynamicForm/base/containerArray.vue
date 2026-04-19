<template>
  <el-row class="m-0! w-full" :gutter="0" ref="row">
    <FormItem
      :form="item"
      v-for="(item, itemIndex) in form.list"
      :span="item.span"
      :key="item.id"
      :class="getItemClass(Number(itemIndex))"
    >
      itemIndex: {{ itemIndex }}
      <ContainerObject :index="itemIndex" :form="item" />
      <div class="flex" v-if="item.ui">
        <el-button @click="moveUp(itemIndex)" :disabled="itemIndex === 0">上移</el-button>
        <el-button @click="moveDown(itemIndex)" :disabled="itemIndex === length - 1"
          >下移</el-button
        >
        <el-button @click="add()">添加</el-button>
        <el-button @click="remove(itemIndex)">删除</el-button>
      </div>
    </FormItem>
  </el-row>
</template>

<script setup lang="ts">
import { getUUID } from '@/utils'
import { computed, inject, onMounted } from 'vue'
import { useDraggable } from 'vue-draggable-plus'
import ContainerObject from './containerObject.vue'
import FormItem from './formItem.vue'
const row: any = useTemplateRef('row')

defineProps<{
  index?: any
}>()

const form = defineModel<any>('form')
provide('currentForm', form)
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

// 动态计算类名算法：实现第一个左边距0，最后一个右边距0，其他左右各6
const getItemClass = (index: number) => {
  const list = form.value.list
  let currentAccumulatedSpan = 0
  let isFirstInRow = false
  let isLastInRow = false

  // 计算当前元素在第几行，以及行首行尾状态
  for (let i = 0; i < list.length; i++) {
    const span = Number(list[i].span) || 24
    if (currentAccumulatedSpan + span > 24) {
      currentAccumulatedSpan = 0
    }

    if (i === index) {
      isFirstInRow = currentAccumulatedSpan === 0

      const nextItem = list[i + 1]
      const nextSpan = nextItem ? Number(nextItem.span) || 24 : 0
      isLastInRow =
        currentAccumulatedSpan + span === 24 ||
        (nextItem && currentAccumulatedSpan + span + nextSpan > 24) ||
        i === list.length - 1
    }

    currentAccumulatedSpan += span
    if (currentAccumulatedSpan >= 24) {
      currentAccumulatedSpan = 0
    }
  }

  // 再次计算总行数，用于判断是否为最后一行
  let totalAccumulatedSpan = 0
  for (let i = 0; i < list.length; i++) {
    const span = Number(list[i].span) || 24
    if (totalAccumulatedSpan + span > 24) {
      totalAccumulatedSpan = 0
    }
    totalAccumulatedSpan += span
    if (totalAccumulatedSpan >= 24) {
      totalAccumulatedSpan = 0
    }
  }

  const classList = []

  // 水平边距逻辑：
  // 1. 如果既是行首又是行尾（span=24），左右边距都是0
  // 2. 如果只是行首，左边距0，右边距6
  // 3. 如果只是行尾，右边距0，左边距6
  // 4. 中间元素，左右都是6
  if (isFirstInRow && isLastInRow) classList.push('px-0 pb-[6px]')
  else if (isFirstInRow) classList.push('pl-0 pr-[6px] pb-[6px]')
  else if (isLastInRow) classList.push('pr-0 pl-[6px] pb-[6px]')
  else classList.push('px-[6px] ')

  return classList.join(' ')
}

const moveUp = (index: any) => {
  if (index === 0) return
  const [item] = form.value.list.splice(index, 1)
  form.value.list.splice(index - 1, 0, item)
  dataProxy.move(form.value.list, index, index - 1)
}

const moveDown = (index: any) => {
  if (index === length.value - 1) return
  const [item] = form.value.list.splice(index, 1)
  form.value.list.splice(index + 1, 0, item)
  dataProxy.move(form.value.list, index, index + 1)
}

const remove = (index: any) => {
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
