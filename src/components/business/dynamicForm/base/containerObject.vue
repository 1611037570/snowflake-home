<template>
  <component
    :is="component"
    v-bind="{
      ...dataProxy.getDataProxy(form.data, index),
      ...form.props,
    }"
    v-on="dataProxy.setDataProxy(form.data, index)"
  ></component>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { getComponent } from '../components'

const props = defineProps<{
  index?: any
  form: any
}>()
provide('currentIndex', props.index)
const dataProxy = inject<any>('dataProxy')

const component = getComponent(props.form?.component)
</script>

<style scoped></style>
