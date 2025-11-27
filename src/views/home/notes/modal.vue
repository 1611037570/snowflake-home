<script setup>
import { useNoteStore } from '@/stores'
import NoteList from './components/noteList.vue'
const noteStore = useNoteStore()
const { delNote } = noteStore

const { noteList, currentIndex, noteVisible } = storeToRefs(noteStore)

function switchStatus(key) {
  noteList.value[currentIndex.value][key] = !noteList.value[currentIndex.value][key]
}
const currentNote = computed(() => noteList.value[currentIndex.value])

function del() {
  ElMessageBox.confirm('该操作将永久删除当前便签，是否继续？', '删除当前便签', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    delNote()
  })
}
const noteStatusList = computed(() => {
  console.log('currentIndex.value 1 ', currentIndex.value)
  if (currentIndex.value == -1) {
    console.log('currentIndex.value 2 ', currentIndex.value)
    return []
  }
  const item = currentNote.value
  return [
    {
      info: item.top ? '取消置顶' : '固定在起始页',
      fn: () => switchStatus('top'),
      value: item.top,
      disabled: item.todo,
      icon: 'ic:round-push-pin',
    },
    {
      info: item.todo ? '取消待办' : '设为待办',
      fn: () => switchStatus('todo'),
      value: item.todo,
      icon: 'pajamas:todo-add',
    },
    {
      info: item.md ? '取消Markdown' : '设为Markdown',
      fn: () => switchStatus('md'),
      value: item.md,
      icon: 'ph:file-md-duotone',
    },
    {
      info: '设置背景颜色',
      value: item.bgColor,
      fn: () => switchStatus('bgColor'),
      icon: 'fluent-mdl2:color-solid',
    },
    {
      info: '分享到便签墙',
      value: item.bgColor,
      fn: () => switchStatus('bgColor'),
      icon: 'icon-park-outline:send-one',
    },
    {
      info: '删除',
      value: item.del,
      fn: () => del(),
      icon: 'ic:round-delete',
    },
  ]
})
</script>

<template>
  <SfModal v-model="noteVisible" v-if="noteVisible" title="便签">
    <div class="flex h-[500px] w-[600px]">
      <NoteList />
      <div class="flex flex-1 flex-col" v-if="currentIndex != -1">
        <div class="mb-3 flex gap-3">
          <SfTooltip :content="item.info" v-for="item in noteStatusList" :key="item.info">
            <SfIcon
              :icon="item.icon"
              size="5"
              @click="item.fn()"
              :class="{ 'bg-sf-theme-hover text-sf-theme': item.value }"
              boxSize="8"
              class="rounded-lg bg-sf-primary-hover hover:bg-sf-theme-hover hover:text-sf-theme"
            />
          </SfTooltip>
        </div>
        <div class="w-full">
          <SfInput
            class="flex-1 rounded-xl bg-pink-400 p-1"
            v-model="currentNote.value"
            maxlength="200"
            style="width: 240px"
            placeholder="Please input"
            show-word-limit
            type="textarea"
          />
        </div>
      </div>
    </div>
  </SfModal>
</template>
<style lang="scss" scoped></style>
