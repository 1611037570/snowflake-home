<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import Content from '../theme/content.vue'
import Title from '../theme/title.vue'

const resumeStore = useResumeStore()
const { currentData } = storeToRefs(resumeStore)

const skill = computed(() => currentData.value.skill || '')
</script>

<template>
  <div class="flex flex-col">
    <Title title="专业技能" />
    <Content :content="skill" />
  </div>
</template>

<style lang="scss" scoped></style>
