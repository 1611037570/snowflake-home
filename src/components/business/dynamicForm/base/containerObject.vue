<template>
  <component
    :is="component"
    v-bind="{
      ...rootData.getDataProxy(form.model, props.currentIndex),
      ...form.props,
      // ...$attrs,
    }"
    v-on="rootData.setDataProxy(form.model, props.currentIndex)"
  ></component>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { getComponent } from '../components'

const props = defineProps<{
  currentIndex?: any
  form: any
}>()

const rootData = inject<any>('df/root/data')

const component = getComponent(props.form?.component)
const emit = defineEmits(['removeObject'])

function remove() {
  emit('removeObject', props.currentIndex)
}
// 提供当前容器的索引
provide('df/current/index', props.currentIndex)
// 提供当前容器的表单数据
provide('df/current/form', props.form)
// 提供当前容器的类型
provide('df/current/type', 'object')
// 提供删除方法
provide('df/remove', remove)
</script>

<style scoped></style>
