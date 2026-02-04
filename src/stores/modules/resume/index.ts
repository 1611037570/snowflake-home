import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { defaultData, type ResumeData } from './dataConfig'

export interface ResumeItem {
  data: ResumeData
  config: any // 暂时使用 any，或者根据需要定义配置类型
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

    // 获取当前选中的简历配置
    const currentConfig = computed(() => list.value[currentIndex.value]?.config)

    // 新增简历
    const addResume = () => {
      list.value.push({
        data: structuredClone(defaultData),
        config: {},
      })
      currentIndex.value = list.value.length - 1
    }

    // 初始化数据合并，防止版本更新导致字段缺失
    const init = () => {
      list.value = list.value.map((item: any) => {
        // 如果是老版本数据（没有 data 字段），则进行转换
        const oldData = item.data ? item.data : item
        const oldConfig = item.config ? item.config : {}

        const baseData = structuredClone(defaultData)

        return {
          data: {
            ...baseData,
            ...oldData,
            user: {
              ...baseData.user,
              ...oldData.user,
            },
          },
          config: {
            ...oldConfig,
          },
        }
      })
    }

    return { indexVisible, list, currentIndex, currentData, currentConfig, addResume, init }
  },
  {
    persist: {
      pick: ['list'],
    },
  },
)
