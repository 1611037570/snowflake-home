<template>
  <SfModal v-if="indexVisible" v-model="indexVisible">
    <div v-if="list.length"></div>
    <div v-else>
      <ElButton @click="openResume">制作第一个简历</ElButton>
    </div>
  </SfModal>
</template>

<script setup>
import { useResumeStore } from '@/stores'
import { routerNavigation } from '@/utils'
import { storeToRefs } from 'pinia'
const resumeStore = useResumeStore()
const { indexVisible, list } = storeToRefs(resumeStore)

const openResume = () => {
  routerNavigation('resume')
}
</script>

<style scoped></style>
