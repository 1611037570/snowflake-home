<script setup>
import { useNoteStore, useThemeStore } from "@/stores";
import { MdEditor, MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import NoteList from "./components/noteList.vue";
const noteStore = useNoteStore();
const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);
const { delNote } = noteStore;

const { noteList, currentIndex } = storeToRefs(noteStore);

function switchStatus(key) {
  noteList.value[currentIndex.value][key] = !noteList.value[currentIndex.value][key];
}
const currentNote = computed(() => noteList.value[currentIndex.value]);

function del() {
  delNote();
}
const noteStatusList = computed(() => {
  console.log("currentIndex.value 1 ", currentIndex.value);
  if (currentIndex.value == -1) {
    console.log("currentIndex.value 2 ", currentIndex.value);
    return [];
  }
  const item = currentNote.value;
  return [
    {
      info: item.top ? "取消置顶" : "固定在起始页",
      fn: () => switchStatus("top"),
      value: item.top,
      disabled: item.todo,
      icon: "ic:round-push-pin",
    },
    {
      info: item.todo ? "取消待办" : "设为待办",
      fn: () => switchStatus("todo"),
      value: item.todo,
      icon: "pajamas:todo-add",
    },
    {
      info: item.md ? "取消Markdown" : "设为Markdown",
      fn: () => switchStatus("md"),
      value: item.md,
      icon: "ph:file-md-duotone",
    },
    {
      info: "设置背景颜色",
      value: item.bgColor,
      fn: () => switchStatus("bgColor"),
      icon: "fluent-mdl2:color-solid",
    },
    {
      info: "分享到便签墙",
      value: item.bgColor,
      fn: () => switchStatus("bgColor"),
      icon: "icon-park-outline:send-one",
    },
    {
      info: "删除",
      value: item.del,
      fn: () => del(),
      icon: "ic:round-delete",
    },
  ];
});
</script>

<template>
  <div class="flex h-[500px] w-[1500px]">
    <NoteList />
    <div class="flex flex-1 flex-col border border-sf-theme">
      <template v-if="currentIndex != -1">
        <div class="mb-3 flex gap-3">
          <SfTooltip :content="item.info" v-for="item in noteStatusList" :key="item.info">
            <SfIcon
              :icon="item.icon"
              size="5"
              @click="item.fn()"
              :class="{ 'bg-sf-theme-2 text-sf-theme': item.value }"
              boxSize="8"
              class="rounded-lg bg-sf-primary-hover hover:bg-sf-theme-2 hover:text-sf-theme"
            />
          </SfTooltip>
        </div>
        <div class="flex w-full flex-1 gap-2 overflow-hidden">
          <div class="flex-1 overflow-auto">
            <!-- Markdown 编辑器：纯编辑模式，禁用预览和自定义滚动条 -->
            <MdEditor
              v-model="currentNote.value"
              placeholder="Please input"
              style="height: 100%"
              :theme="theme"
              :toolbarsExclude="['github', 'save', 'htmlPreview', 'catalog', 'preview']"
              editorId="note-editor"
              :maxLength="200"
              :htmlPreview="false"
              :preview="false"
            />
          </div>
          <div class="flex-1 overflow-auto">
            <MdPreview :modelValue="currentNote.value" :theme="theme" editorId="note-preview" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<style lang="scss" scoped>
/* 深度覆盖编辑器内部样式，去除多余边框和分割线 */
:deep(.md-editor-content) {
  border: none !important;
}
:deep(.md-editor-content-editor) {
  border-right: none !important;
}
:deep(.md-editor-custom-scrollbar__track) {
  background: transparent !important;
  border: none !important;
  width: 0 !important;
}
</style>
