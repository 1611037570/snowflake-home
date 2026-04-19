<template>
  <el-row class="m-0! w-full" :gutter="0" ref="row">
    <FormItem
      :form="item"
      v-for="(item, itemIndex) in form.list"
      :span="item.span"
      :key="item.id"
      :class="getItemClass(Number(itemIndex))"
    >
      <!-- v-bind="$attrs"  -->
      <ContainerObject :currentIndex="itemIndex" :form="item" />
      <div class="flex" v-if="item.ui">
        <el-button @click="moveUp(itemIndex)" :disabled="itemIndex === 0">上移</el-button>
        <el-button @click="moveDown(itemIndex)" :disabled="itemIndex === length - 1"
          >下移</el-button
        >

        <el-button @click="remove(itemIndex)">删除</el-button>
      </div>
    </FormItem>

    <el-button @click="add()" v-if="0">添加</el-button>
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
const rootData = inject<any>('df/root/data')

useDraggable(row, form.value.list, {
  handle: form.value?.dragClass || '',
  animation: 150,
  ghostClass: 'ghost',
  disabled: !form.value?.drag,
  onEnd(data: any) {
    // 获取旧索引和新索引
    const { oldIndex, newIndex } = data
    if (oldIndex === newIndex) return
    const [item] = form.value.list.splice(oldIndex, 1)
    form.value.list.splice(newIndex, 0, item)
    rootData.move(form.value.list, oldIndex, newIndex)
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

// 上移
const moveUp = (index: any) => {
  if (index === 0) return
  const [item] = form.value.list.splice(index, 1)
  form.value.list.splice(index - 1, 0, item)
  rootData.move(form.value.list, index, index - 1)
}
// 下移
const moveDown = (index: any) => {
  if (index === length.value - 1) return
  const [item] = form.value.list.splice(index, 1)
  form.value.list.splice(index + 1, 0, item)
  rootData.move(form.value.list, index, index + 1)
}
// 删除
const remove = (index: any) => {
  rootData.removeItem(form.value.list, index)
  form.value.list.splice(index, 1)
}
// 添加
const add = () => {
  const addConfig = form.value.addConfig
  if (!addConfig) return
  form.value.list.push(addConfig)
}
// 提供当前容器的长度
provide('df/current/length', length)
// 提供当前容器的表单数据
provide('df/current/form', form)
// 提供当前容器的类型
provide('df/current/type', 'array')
// 提供添加方法
provide('df/add', add)
// 提供删除方法
provide('df/removeItem', remove)
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
