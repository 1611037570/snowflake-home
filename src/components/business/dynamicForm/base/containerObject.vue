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

<script setup>
import { inject, onMounted } from 'vue'
import { getComponent } from '../components'

const { form } = defineProps({
  index: {
    type: Number,
  },
  form: {
    type: Object,
  },
})
const dataProxy = inject('dataProxy')

const component = getComponent(form.component)
onMounted(() => {})
</script>

<style scoped></style>
