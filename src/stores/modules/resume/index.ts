import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { userData, type UserData } from './dataConfig'
import { userConfig } from './formConfig'

export interface ResumeItem {
  data: UserData
  config: any // 暂时使用 any，或者根据需要定义配置类型
  ui: {
    paddingIndex: number
    fontIndex: number
    lineHeightIndex: number
    colorIndex: number
  }
}

export const useResumeStore = defineStore(
  'resume',
  () => {
    const indexVisible = ref(false)

    // 简历列表
    const list = ref<ResumeItem[]>([])

    // 当前选中的下标
    const currentIndex = ref(0)

    // 获取当前选中的简历数据
    const currentData = computed(() => list.value[currentIndex.value]?.data)

    // 获取当前选中的表单配置
    const currentConfig = computed({
      get() {
        return list.value[currentIndex.value]?.config
      },
      set(newConfig) {
        list.value[currentIndex.value].config = newConfig
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
        config: [userConfig],
        ui: {
          paddingIndex: 1,
          fontIndex: 1,
          lineHeightIndex: 1,
          colorIndex: 0,
        },
      })
      currentIndex.value = list.value.length - 1
    }

    // 初始化数据合并，防止版本更新导致字段缺失
    const init = () => {
      list.value = list.value.map((item: any) => {
        // 如果是老版本数据（没有 data 字段），则进行转换
        const oldData = item.data ? item.data : item
        const oldConfig = item.config ? item.config : []
        const oldUI = item.ui
          ? item.ui
          : { paddingIndex: 1, fontIndex: 1, lineHeightIndex: 1, colorIndex: 0 }

        const baseData = structuredClone(userData)

        return {
          data: {
            ...baseData,
            ...oldData,
            user: {
              ...baseData.user,
              ...oldData.user,
            },
          },
          config: oldConfig,
          ui: {
            paddingIndex: 1,
            fontIndex: 1,
            lineHeightIndex: 1,
            colorIndex: 0,
            ...oldUI,
          },
        }
      })
    }

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
