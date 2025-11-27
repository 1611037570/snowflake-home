<script setup>
import { useNoteStore } from '@/stores'
import { computed, ref } from 'vue'
const noteStore = useNoteStore()
const { topNoteList, autoCollapse, currentIndex, noteVisible } = storeToRefs(noteStore)
const expand = ref(false)

// 计算卡片容器的位置类
const containerClasses = computed(() => {
  // 如果启用了自动收缩，根据展开状态决定位置
  if (autoCollapse.value) {
    return expand.value ? 'translate-x-[0%]' : 'translate-x-[-70%]'
  }
  // 未启用自动收缩时，始终显示
  return 'translate-x-[0%]'
})
// 选择便签项并保存其索引
const select = (item) => {
  // 遍历noteList找到匹配id的项的索引
  const index = noteStore.noteList.findIndex((note) => note.id === item.id)
  // 如果找到匹配项，设置currentIndex
  if (index !== -1) {
    currentIndex.value = index
    noteVisible.value = true
  }
}
</script>
<template>
  <div
    class="fixed top-0 left-0 z-50 flex w-[340px] transform flex-col gap-3 py-20 pl-12 transition-all duration-300"
    :class="[containerClasses]"
    @mouseenter="expand = true"
    @mousemove="expand = true"
    @mouseleave="expand = false"
  >
    <div
      v-for="item in topNoteList"
      :key="item.id"
      class="w-[240px] cursor-pointer rounded-lg bg-white p-3"
      @click="select(item)"
    >
      <SfIcon
        v-if="item.todo"
        icon="pajamas:todo-done"
        size="5"
        @click="item.todoDone = !item.todoDone"
        boxSize="8"
        :class="[
          {
            'bg-sf-theme-hover text-sf-theme': item.todoDone,
          },
        ]"
        class="rounded-lg bg-sf-primary-hover hover:bg-sf-theme-hover hover:text-sf-theme"
      />
      {{ item.value }}12331231
    </div>
  </div>
</template>
<style scoped></style>
