<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'

import ResumeEditor from './resumeEditor.vue'
import ResumeMain from './resumeMain.vue'

const resumeStore = useResumeStore()
const { currentIndex } = storeToRefs(resumeStore)
</script>

<template>
  <div>
    <ResumeEditor v-if="currentIndex" />
    <ResumeMain v-else />
  </div>
</template>

<style lang="scss" scoped></style>
