import { getUUID } from '@/utils'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
// 从types目录导入NoteItem接口
import type { NoteItem } from '@/types/note'
const note_data: NoteItem = {
  value: '00',
  // 创建时间
  createTime: Date.now(),
  // 最后修改时间
  endTime: Date.now(),
  id: '',
  // 置顶
  top: false,
  // 是否开启md模式
  md: false,
  // 是否开启待办模式
  todo: false,
  // 是否完成待办
  todoDone: false,
  // 背景色
  bgColor: '',
}
export const useNoteStore = defineStore(
  'note',
  () => {
    const noteVisible = ref<boolean>(false)
    // 自动收缩
    const autoCollapse = ref<boolean>(true)
    // 便签列表
    const noteList = ref<NoteItem[]>([])
    // 当前选中的便签索引
    const currentIndex = ref<number>(-1)

    // 置顶列表：同时包含置顶项和待办项，待办项排在最前面
    const topNoteList = computed(() => {
      const list = noteList.value
        .filter((item: any) => item?.top || item?.todo)
        // 排序逻辑：待办项排在前面
        .sort((a: any, b: any) => {
          // 如果a是待办而b不是待办，a排在前面
          if (a?.todo && !b?.todo) return -1
          // 如果b是待办而a不是待办，b排在前面
          if (!a?.todo && b?.todo) return 1
          // 其他情况保持原有顺序
          return 0
        })
      return list
    })
    // 添加便签
    function addNote() {
      noteList.value.push({
        ...note_data,
        id: getUUID(),
      })
    }
    function delNote() {
      const index = currentIndex.value
      currentIndex.value = -1
      noteList.value.splice(index, 1)
    }
    return {
      noteList,
      addNote,
      topNoteList,
      currentIndex,
      noteVisible,
      autoCollapse,
      delNote,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['noteList', 'autoCollapse'],
    },
  },
)
