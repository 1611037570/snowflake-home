<template>
  <!-- 容器组件包裹 -->
  <component :is="getComponent(form.component)" v-bind="form.props">
    <template #[getSlot()]>
      <FormRenderer v-model:items="form.children" />
    </template>
  </component>
</template>

<script setup lang="ts">
import { isString } from '@/utils'
import { getComponent } from '../components'
import FormRenderer from './formRenderer.vue'

const form = defineModel<any>('form')
const currentIndex = defineModel<any>('currentIndex')

// 处理插槽名称
function getSlot() {
  const slotName = form.value?.slot
  if (isString(slotName) && slotName.length) {
    return slotName
  }
  return 'default'
}
const emit = defineEmits(['remove'])
function remove() {
  emit('remove', currentIndex.value)
}
// 提供当前容器的表单数据
provide('df/current/form', form)
// 提供当前容器的索引
provide('df/current/index', currentIndex)
// 提供删除方法
provide('df/remove', remove)
// 提供当前容器的类型
provide('df/current/type', 'container')
</script>

<style scoped></style>
