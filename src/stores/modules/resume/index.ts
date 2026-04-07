import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { userData, type UserData } from './dataConfig'
import { userForm } from './formConfig'

export interface ResumeItem {
  data: UserData
  config: any // 暂时使用 any，或者根据需要定义配置类型
  ui: {
    padding: number
    fontSize: number
    lineHeight: number
    color: string
    fontFamily: string
  }
}

export const useResumeStore = defineStore(
  'resume',
  () => {
    const indexVisible = ref(false)

    // 简历列表
    const list = ref<any[]>([])

    // 当前选中的下标
    const currentIndex = ref(-1)

    // 获取当前选中的简历数据
    const currentData = computed(() => list.value[currentIndex.value]?.data)

    // 获取当前选中的表单配置
    const currentConfig = computed({
      get() {
        return list.value[currentIndex.value]?.config
      },
      set(newConfig) {
        if (list.value[currentIndex.value]) {
          list.value[currentIndex.value].config = newConfig
        }
      },
    })

    // 获取当前选中的UI配置
    const currentUI = computed({
      get() {
        return list.value[currentIndex.value]?.ui
      },
      set(newUI) {
        if (list.value[currentIndex.value]) {
          list.value[currentIndex.value].ui = newUI
        }
      },
    })

    // 新增简历
    const addResume = () => {
      list.value.push({
        data: structuredClone(userData),
        config: {
          drag: true,
          fields: [...userForm],
        },
        ui: {
          padding: 24,
          fontSize: 12,
          lineHeight: 24,
          color: '#ff4d4f',
          fontFamily: 'font-alipu',
        },
      })
      currentIndex.value = list.value.length - 1
    }

    // 初始化数据合并，防止版本更新导致字段缺失
    const init = () => {}

    return {
      indexVisible,
      list,
      currentIndex,
      currentData,
      currentConfig,
      currentUI,
      addResume,
      init,
    }
  },
  {
    persist: {
      pick: ['list'],
    },
  },
)
