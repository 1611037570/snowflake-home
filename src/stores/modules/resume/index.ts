import confirm from '@/components/business/confirm'
import router from '@/routers'
import { getUUID } from '@/utils'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { DEFAULT_DATA } from './dataConfig'
import { DEFAULT_CONFIG, DEFAULT_USER_CONFIG } from './formConfig'
import {
  defaultColor,
  defaultFontFamily,
  defaultFontSize,
  defaultLineHeight,
  defaultPadding,
} from './uiConfig'

import { merge } from 'lodash-es'
export type ResumeLayout = 'list' | 'three' | 'ai'
// 默认简历项
const DEFAULT_RESUME_ITEM = {
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
    // 页边距
    padding: defaultPadding,
    // 字体大小
    fontSize: defaultFontSize,
    // 行高
    lineHeight: defaultLineHeight,
    // 字体颜色
    color: defaultColor,
    // 字体类型
    fontFamily: defaultFontFamily,
  },
  // 使用信息
  usage: {
    // 是否自定义标题
    customTitle: '',
    // 最后使用时间
    lastUseTime: Date.now(),
    // 创建时间
    createTime: Date.now(),
  },
}
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
    // 最大简历数量
    const maxCount = 5
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
    const currentUsage = computed(() => {
      const item = getCurrentResumeItem()
      return item ? item.usage : undefined
    })
    // 新增简历
    const addResume = (config: any) => {
      if (list.value.length >= maxCount) {
        confirm(`请前往我的简历管理删除后再新建。`, '容量已满').then(() => {
          router.push(`/resumeMain?type=mine&t=${Date.now()}`)
        })
        return
      }
      const res = config ? mergeResumeItem(config) : DEFAULT_RESUME_ITEM
      list.value.push(res)
      currentIndex.value = list.value.length - 1
      router.push('/resume')
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
    const mergeResumeItem = (item: any) => {
      return merge(DEFAULT_RESUME_ITEM, item)
    }
    // 初始化数据合并，防止版本更新导致字段缺失
    const init = () => {
      list.value = list.value.map(mergeResumeItem)
    }
    const addTemplate = (template: any) => {
      list.value.push(mergeResumeItem(template))
    }

    return {
      indexVisible,
      list,
      maxCount,
      currentIndex,
      layout,
      currentData,
      currentConfig,
      currentFixedConfig,
      currentUI,
      currentUsage,
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
