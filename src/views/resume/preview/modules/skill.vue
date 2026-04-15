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
  <Title title="专业技能" :style="[fontValue(), lineHeightValue()]" />
  <Content :content="skill" :style="[fontValue(), lineHeightValue()]" />
</template>

<style lang="scss" scoped></style>
