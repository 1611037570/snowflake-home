<template>
  <component
    :is="component"
    v-bind="{
      ...dataProxy.getDataProxy(form.data),
      ...form.props,
    }"
    v-on="dataProxy.setDataProxy(form.data)"
  ></component>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { getComponent } from '../components'

const props = defineProps<{
  index?: number
  form: any
}>()

const dataProxy = inject<any>('dataProxy')

const component = getComponent(props.form?.component)
</script>

<style scoped></style>
