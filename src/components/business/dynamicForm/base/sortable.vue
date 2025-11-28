<script setup>
// import Sortable from 'sortablejs'
import { nextTick, onMounted, useTemplateRef } from 'vue'

const props = defineProps({
  handle: {
    type: String,
    default: 'handle',
  },
  sortable: {
    type: Boolean,
    default: true,
  },
})

const emits = defineEmits(['onStart', 'onEnd'])

// 拖拽实例
const sortableRef = useTemplateRef('sortableRef')

// 初始化拖拽实例
const initSortable = () => {
  // 创建拖拽实例
  new Sortable(sortableRef.value, {
    handle: `.${props.handle}`,
    animation: 150,
    ghostClass: 'hide-class',
    filter: '.filter',
    // 开始拖拽时
    onStart: function (evt) {
      emits('onStart', evt)
    },
    // 结束拖拽时
    onEnd({ newIndex, oldIndex, to }) {
      const id = to?.getAttribute('data-id')
      emits('onEnd', { newIndex, oldIndex, id })
    },
  })
}

// 组件挂载后初始化拖拽实例
onMounted(async () => {
  await nextTick(() => {})
  initSortable()
})
</script>

<template>
  <div ref="sortableRef">
    <slot></slot>
  </div>
</template>
<style scoped></style>
