<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed, inject } from 'vue'
import Content from '../theme/content.vue'
import Title from '../theme/title.vue'

const resumeStore = useResumeStore()
const { currentData } = storeToRefs(resumeStore)

const fontValue = inject('fontValue')
const lineHeightValue = inject('lineHeightValue')

const skill = computed(() => currentData.value.skill || '')
</script>

<template>
  <div class="resume-row" data-module="skill" :style="[lineHeightValue(), fontValue()]">
    <Title title="专业技能" />
    <Content :content="skill" />
  </div>
</template>

<style lang="scss" scoped></style>
