<template>
  <component :is="component" v-bind="bindProps" v-on="bindEvent"></component>
</template>

<script setup lang="ts">
import { inject, toRef } from 'vue'
import { getComponent } from '../components'

const props = defineProps<{
  currentIndex?: any
  form: any
}>()
const bindProps = computed(() => {
  return {
    ...rootData.getDataProxy(props.form.model, props.currentIndex),
    ...props.form.props,
    // ...$attrs,
  }
})
const bindEvent = computed(() => {
  return rootData.setDataProxy(props.form.model, props.currentIndex)
})
const rootData = inject<any>('df/root/data')

const component = getComponent(props.form?.component)
const emit = defineEmits(['removeObject'])

function remove() {
  emit('removeObject', props.currentIndex)
}
// 提供当前容器的索引
provide('df/current/index', toRef(props, 'currentIndex'))
// 提供当前容器的表单数据
provide('df/current/form', props.form)
// 提供当前容器的类型
provide('df/current/type', 'object')
// 提供删除方法
provide('df/remove', remove)
</script>

<style scoped></style>
