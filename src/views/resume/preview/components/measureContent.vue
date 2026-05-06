<script setup>
import ResumeModule from '../modules/index.vue'

defineProps({
  currentData: {
    type: Object,
    required: true,
  },
  allModules: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <ResumeModule
    :data="currentData"
    :name="item.key"
    v-for="(item, index) in allModules"
    :key="index"
    :data-module="item.key"
    class="resume-module-wrapper"
  />
</template>
