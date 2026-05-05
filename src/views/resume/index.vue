<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'

import ResumeEditor from './resumeEditor.vue'
import ResumeMain from './resumeMain.vue'

const resumeStore = useResumeStore()
const { currentIndex } = storeToRefs(resumeStore)
</script>

<template>
  <ResumeEditor v-if="currentIndex !== -1" />
  <ResumeMain v-else />
</template>

<style lang="scss" scoped></style>
