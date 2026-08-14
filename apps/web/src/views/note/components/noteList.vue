<template>
  <div class="w-[200px]">
    <ElScrollbar class="flex h-full flex-col pr-2.5">
      <div
        @click="noteStore.addNote()"
        class="box cursor-pointer; flex flex-col rounded-xl p-2 transition-all duration-300 hover:bg-sf-theme-hover"
        :class="{ 'bg-sf-theme': currentIndex === -1 }"
      >
        新建便签
      </div>
      <div
        v-for="(item, index) in noteList"
        :key="index"
        @click="setCurrentIndex(index)"
        class="box cursor-pointer; flex flex-col rounded-xl p-2 transition-all duration-300 hover:bg-sf-theme-hover"
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
            {{ item.value || "空便签" }}
          </div>
        </div>
        <div class="flex items-center text-sm text-sf-text-2">
          {{ dayjs(item.endTime).format("YYYY-MM-DD HH:mm") }}
        </div>
      </div>
    </ElScrollbar>
  </div>
</template>

<script setup>
import { useNoteStore } from "@/stores";
import dayjs from "dayjs";
const noteStore = useNoteStore();
const { noteList, currentIndex } = storeToRefs(noteStore);

const setCurrentIndex = (index) => {
  currentIndex.value = index;
};
</script>

<style lang="scss" scoped>
.box {
  @apply flex cursor-pointer flex-col rounded-xl p-2 transition-all duration-300  hover:bg-sf-theme-hover;
}
</style>
