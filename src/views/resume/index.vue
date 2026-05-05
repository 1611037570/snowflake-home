<template>
  <div class="flex h-full w-full flex-col bg-sf-bg" v-if="currentIndex != -1">
    <Header />
    <div class="flex w-full flex-1 overflow-hidden" v-if="currentIndex >= 0">
      <Transition name="resume-builder">
        <Builder v-if="layout !== 'ai'" />
      </Transition>

      <Preview />
      <Transition name="resume-assistant">
        <Assistant v-if="layout !== 'list'" />
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import Assistant from './assistant/index.vue'
import Builder from './builder/index.vue'
import Header from './components/header/index.vue'
import Preview from './preview/index.vue'

const resumeStore = useResumeStore()
const { currentIndex, layout, list } = storeToRefs(resumeStore)

onMounted(() => {
  if (currentIndex.value !== -1) return
  if (list.value.length) {
    currentIndex.value = 0
    return
  }
  resumeStore.addResume()
})
</script>

<style scoped>
.resume-builder-enter-active,
.resume-builder-leave-active,
.resume-assistant-enter-active,
.resume-assistant-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.resume-builder-enter-from,
.resume-builder-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.resume-assistant-enter-from,
.resume-assistant-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
