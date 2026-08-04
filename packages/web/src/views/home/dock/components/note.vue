<template>
  <div
    class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 text-[10px] backdrop-blur-md transition-all duration-200"
    @click="openNote"
  >
    便签
  </div>
</template>

<script setup>
import { useNoteStore } from '@/stores'
const noteStore = useNoteStore()
const { noteVisible } = storeToRefs(noteStore)

const openNote = () => {
  noteVisible.value = true
}
</script>

<style scoped></style>
