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
provide('df/current/form', form)
provide('df/current/index', currentIndex)
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
provide('df/remove', remove)
</script>

<style scoped></style>
