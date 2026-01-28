<template>
  <FormItem :config="config">
    <component
      :is="component"
      v-bind="dataProxy.getDataProxy(config.data)"
      v-on="dataProxy.setDataProxy(config.data)"
    ></component>
  </FormItem>
</template>

<script setup>
import { inject, onMounted } from 'vue'
import { getComponent } from '../components'
import FormItem from './formItem.vue'

const { config } = defineProps({
  index: {
    type: Number,
  },
  config: {
    type: Object,
  },
})
const dataProxy = inject('dataProxy')

const component = getComponent(config.component)
onMounted(() => {})
</script>

<style scoped></style>
