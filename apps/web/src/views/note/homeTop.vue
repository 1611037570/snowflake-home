<script setup>
import { useNoteStore } from "@/stores";
import { computed, ref } from "vue";
const noteStore = useNoteStore();
const { topNoteList, autoCollapse, currentIndex, noteVisible } = storeToRefs(noteStore);
const expand = ref(false);

// 计算卡片容器的位置类
const containerClasses = computed(() => {
  // 如果启用了自动收缩，根据展开状态决定位置
  if (autoCollapse.value) {
    return expand.value ? "translate-x-[0%]" : "translate-x-[-70%]";
  }
  // 未启用自动收缩时，始终显示
  return "translate-x-[0%]";
});
// 选择便签项并保存其索引
function select(item) {
  // 遍历noteList找到匹配id的项的索引
  const index = noteStore.noteList.findIndex((note) => note.id === item.id);
  // 如果找到匹配项，设置currentIndex
  if (index !== -1) {
    currentIndex.value = index;
    noteVisible.value = true;
  }
}
// 取消置顶
function cancelTop(item) {
  item.top = false;
}
// 删除便签
function delNote(item) {
  noteStore.delNote(item);
}
</script>
<template>
  <!-- 置顶便签组件111111111111 -->
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
      class="group w-[240px] cursor-pointer rounded-lg bg-white p-3"
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
      {{ item.value || "无内容" }}
      <div class="flex items-center">
        <SfIcon
          @click.stop="cancelTop(item)"
          icon="ic:round-push-pin"
          size="6"
          boxSize="8"
          class="rounded-lg bg-sf-theme-hover text-sf-theme opacity-0 group-hover:opacity-100"
        />
        <SfIcon
          @click.stop="delNote(item)"
          icon="ic:round-delete"
          size="6"
          boxSize="8"
          class="rounded-lg opacity-0 group-hover:opacity-100 hover:bg-sf-theme-hover hover:text-sf-theme"
        />
      </div>
    </div>
  </div>
</template>
<style scoped></style>
