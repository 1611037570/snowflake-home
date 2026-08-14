<template>
  <!-- 容器组件包裹 -->
  <component :is="getComponent(currentForm.component)" v-bind="currentForm.props">
    <template #[getSlot()]>
      <!-- ="slotProps" v-bind="slotProps" -->
      <FormRenderer v-model:items="currentForm" />
    </template>
  </component>
</template>

<script setup lang="ts">
import { isString } from '@/utils'
import { getComponent } from '../components'
import FormRenderer from './formRenderer.vue'

const currentForm = defineModel<any>('currentForm')
const currentIndex = defineModel<any>('currentIndex')

// 处理插槽名称
function getSlot() {
  const slotName = currentForm.value?.slot
  if (isString(slotName) && slotName.length) {
    return slotName
  }
  return 'default'
}
const emit = defineEmits(['removeObject'])
function remove() {
  emit('removeObject', currentIndex.value)
}
// 提供当前容器的表单数据
provide('df/current/form', currentForm)
// 提供当前容器的索引
provide('df/current/index', currentIndex)
// 提供删除方法
provide('df/remove', remove)
// 提供当前容器的类型
provide('df/current/type', 'container')
</script>

<style scoped></style>
