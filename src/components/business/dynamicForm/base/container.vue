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
provide('currentForm', form)
provide('currentIndex', currentIndex)
// 处理插槽名称
function getSlot() {
  const slotName = form.value?.slot
  if (isString(slotName) && slotName.length) {
    return slotName
  }
  return 'default'
}
</script>

<style scoped></style>
