import { defineStore } from 'pinia'
import { ref } from 'vue'

type OpenMode = '_blank' | '_self'

export const useSearchStore = defineStore(
  'search',
  () => {
    // 首次自动聚焦搜索框
    const autoFocus = ref<boolean>(false)
    // 搜索框是否聚焦
    const searchFocus = ref<boolean>(false)
    // 搜索历史
    const searchHistory = ref([])
    // 打开方式
    const openMode = ref<OpenMode>('_blank')
    // 是否显示搜索历史
    const searchHistoryVisible = ref(true)
    // 是否显示热门搜索
    const hotSourceVisible = ref(true)
    // 是否显示应用内搜索
    const appSourceVisible = ref(true)
    // 是否显示快捷方式
    const shortcutVisible = ref(true)
    // 当前web索引
    const currentWebIndex = ref(0)
    // 当前搜索值
    const searchValue = ref('')
    // 当前搜索索引
    const currentIndex = ref(-1)
    // 当前热门搜索源
    const hotSource = ref('百度')

    // 表达式标记
    const expressionsFlag = ref(false)
    // 表达式计算结果
    const expressionsResult = ref('')
    // 表达式锁定
    const expressionsLock = ref(false)
    // 表达式可见
    const expressionsVisible = computed(() => {
      return expressionsFlag.value || expressionsLock.value
    })

    // 下拉菜单显示状态
    const webSourceListVisible = ref(false)
    // 搜索值处理
    const handleValue = computed(() => {
      const value = String(searchValue.value).trim()
      if (!value) return ''
      return encodeURIComponent(value)
    })

    // 翻译
    function getTranslate(item: any) {
      // 参考url
      // https://fanyi.baidu.com/mtpe-individual/transText?query=I%20don%27t%20know&lang=en2zh#/
      // https://fanyi.baidu.com/mtpe-individual/transText#/zh/en/%E4%B8%BA%E4%BB%80%E4%B9%88
      const BASE_URL = 'https://fanyi.baidu.com/mtpe-individual/transText'
      const chineseCharRegex = /[\u4e00-\u9fa5\u3400-\u4dbf\u{20000}-\u{2a6df}]/u
      const fromLang = chineseCharRegex.test(item.value) ? 'en' : 'zh'
      const encodedText = encodeURIComponent(item.value)
      const hash = `#/auto/${fromLang}/${encodedText}`
      return BASE_URL + hash
    }
    // 添加搜索历史记录
    const addSearchHistory = (source: any) => {
      const historyList: any = searchHistory.value

      // 检查并移除重复记录（若存在）
      const duplicateIndex = historyList.findIndex((item: any) => item.value == source.value)
      if (duplicateIndex !== -1) {
        historyList.splice(duplicateIndex, 1) // 移除旧的重复项
      }

      // 添加新记录到头部
      historyList.unshift(source)

      // 检查是否溢出，超过最大长度则删除最旧的记录
      if (historyList.length > 10) {
        historyList.pop()
      }
    }

    // 移除搜索历史记录
    const removeSearchHistory = (index: number) => {
      searchHistory.value.splice(index, 1)
    }

    // 清空搜索历史
    const clearSearchHistory = () => {
      searchHistory.value = []
    }

    const search = (item: any) => {
      // 1、搜索值处理
      console.log('item', item, handleValue.value)
      if (!handleValue.value) return
      let url
      item.value = searchValue.value.trim()
      // 2、根据搜索源类型构建URL
      if (item.type == '百度翻译') {
        url = getTranslate(item)
      } else {
        url = item.url.replace('%s', handleValue.value)
      }
      item.url = url
      // 3、打开搜索结果页面
      open(url)
      // 4、添加搜索历史记录
      if (searchHistoryVisible.value) {
        addSearchHistory(item)
      }
    }
    const open = (url: string) => {
      window.open(url, openMode.value)
    }
    return {
      autoFocus,
      hotSource,
      searchValue,
      handleValue,
      currentWebIndex,
      searchFocus,
      searchHistory,
      searchHistoryVisible,
      hotSourceVisible,
      openMode,
      appSourceVisible,
      shortcutVisible,
      currentIndex,
      expressionsFlag,
      expressionsResult,
      expressionsLock,
      expressionsVisible,
      webSourceListVisible,
      open,
      addSearchHistory,
      removeSearchHistory,
      clearSearchHistory,
      search,
    }
  },
  {
    persist: {
      pick: ['autoFocus', 'searchHistory', 'searchHistoryVisible', 'hotSource'],
    },
  },
)
