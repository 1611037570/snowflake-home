<template>
  <div class="mr-3 flex w-[200px] flex-col">
    <div @click="noteStore.addNote()">add</div>
    <div
      v-for="(item, index) in noteList"
      :key="index"
      @click="setCurrentIndex(index)"
      class="flex flex-col rounded-xl p-2 transition-all duration-300 hover:bg-sf-theme-hover"
      :class="{ 'bg-sf-theme': currentIndex === index }"
    >
      <div class="flex">
        <div class="flex h-5 items-center">
          <SfIcon
            icon="pajamas:todo-done"
            size="4"
            class="mr-1"
            v-if="item.todo"
            @click="item.todoDone = !item.todoDone"
          />
        </div>
        <div class="text-sm leading-5" :class="{ 'line-through': item.todoDone }">
          {{ item.value }}只是打我个改善你o还带你不达瓦大能
        </div>
      </div>
      <div class="flex items-center text-sm text-sf-text-2">
        {{ dayjs(item.endTime).format('YYYY-MM-DD HH:mm') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNoteStore } from '@/stores'
import dayjs from 'dayjs'
const noteStore = useNoteStore()
const { noteList, currentIndex } = storeToRefs(noteStore)

const setCurrentIndex = (index) => {
  currentIndex.value = index
}
</script>

<style lang="scss" scoped></style>
