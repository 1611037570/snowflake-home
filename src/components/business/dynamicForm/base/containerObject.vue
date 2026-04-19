<template>
  <component
    :is="component"
    v-bind="{
      ...rootData.getDataProxy(form.data, index),
      ...form.props,
    }"
    v-on="rootData.setDataProxy(form.data, index)"
  ></component>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { getComponent } from '../components'

const props = defineProps<{
  index?: any
  form: any
}>()
provide('df/current/index', props.index)
const rootData = inject<any>('df/root/data')

const component = getComponent(props.form?.component)
</script>

<style scoped></style>
