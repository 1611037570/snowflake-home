<template>
  <div class="flex h-full w-full flex-col">
    <Header />
    <div class="w-full flex-1 overflow-hidden">
      <SfSplitter v-if="currentIndex >= 0">
        <SfSplitterPanel max="600" min="400">
          <Builder />
        </SfSplitterPanel>
        <SfSplitterPanel>
          <Preview />
        </SfSplitterPanel>
        <Assistant />
      </SfSplitter>
    </div>
  </div>
</template>

<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import Assistant from './assistant/index.vue'
import Builder from './builder/index.vue'
import Header from './components/header/index.vue'
import Preview from './preview/index.vue'

const resumeStore = useResumeStore()
const { list, currentIndex } = storeToRefs(resumeStore)

function init() {
  if (!list.value.length) {
    resumeStore.addResume()
  }
  currentIndex.value = 0
}

onMounted(() => {
  init()
})
</script>

<style scoped></style>
