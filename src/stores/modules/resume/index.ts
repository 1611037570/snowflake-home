import { getUUID } from '@/utils'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { DEFAULT_DATA } from './dataConfig'
import { DEFAULT_CONFIG, DEFAULT_USER_CONFIG } from './formConfig'
import { type Data } from './types'
import {
  defaultColor,
  defaultFontFamily,
  defaultFontSize,
  defaultLineHeight,
  defaultPadding,
} from './uiConfig'

export interface ResumeItem {
  data: Data
  config: any
  ui: {
    padding: number
    fontSize: number
    lineHeight: number
    color: string
    fontFamily: string
  }
}
export type ResumeLayout = 'list' | 'three' | 'ai'

export const useResumeStore = defineStore(
  'resume',
  () => {
    // 索引是否可见
    const indexVisible = ref(false)
    // 是否正在打印
    const isPrinting = ref(false)
    // 当前选中的模块 keys (Set)
    const selectedModuleKeys = ref<Set<string>>(new Set())
    // 简历列表
    const list = ref<any[]>([])
    // 当前选中的简历下标
    const currentIndex = ref(-1)
    const layout = ref<ResumeLayout>('three')

    // 获取当前选中的简历项
    const getCurrentResumeItem = () => {
      return list.value[currentIndex.value]
    }

    // 获取当前选中的简历数据
    const currentData = computed(() => {
      const item = getCurrentResumeItem()
      return item ? item.data : undefined
    })

    // 获取当前选中的表单配置
    const currentConfig = computed({
      get() {
        const item = getCurrentResumeItem()
        return item ? item.config : undefined
      },
      set(newConfig: any) {
        const item = getCurrentResumeItem()
        if (item) {
          item.config = newConfig
        }
      },
    })
    // 获取当前选中的固定配置
    const currentFixedConfig = computed({
      get() {
        const item = getCurrentResumeItem()
        return item ? item.fixedConfig : undefined
      },
      set(newFixedConfig: any) {
        const item = getCurrentResumeItem()
        if (item) {
          item.fixedConfig = newFixedConfig
        }
      },
    })
    // 获取当前选中的UI配置
    const currentUI = computed({
      get() {
        const item = getCurrentResumeItem()
        return item ? item.ui : undefined
      },
      set(newUI: any) {
        const item = getCurrentResumeItem()
        if (item) {
          item.ui = newUI
        }
      },
    })

    // 新增简历
    const addResume = () => {
      const res = {
        // 简历ID
        id: getUUID(),
        // 简历数据
        data: structuredClone(DEFAULT_DATA),
        // 固定配置
        fixedConfig: structuredClone(DEFAULT_USER_CONFIG),
        // 表单配置
        config: structuredClone(DEFAULT_CONFIG),
        // UI配置
        ui: {
          padding: defaultPadding,
          fontSize: defaultFontSize,
          lineHeight: defaultLineHeight,
          color: defaultColor,
          fontFamily: defaultFontFamily,
        },
      }
      list.value.push(res)
      currentIndex.value = list.value.length - 1
    }
    // 删除简历
    const deleteResume = () => {
      if (currentIndex.value == -1) {
        return
      }
      list.value.splice(currentIndex.value, 1)
      currentIndex.value = -1
    }
    const setLayout = (value: ResumeLayout) => {
      layout.value = value
    }

    // 初始化数据合并，防止版本更新导致字段缺失
    const init = () => {}

    return {
      indexVisible,
      list,
      currentIndex,
      layout,
      currentData,
      currentConfig,
      currentFixedConfig,
      currentUI,
      isPrinting,
      selectedModuleKeys,
      addResume,
      deleteResume,
      setLayout,
      init,
    }
  },
  {
    persist: {
      pick: ['list'],
    },
  },
)
