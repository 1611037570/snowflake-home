import { useMutationObserver, useResizeObserver } from '@vueuse/core'
import { nextTick, onMounted, ref, watch, type Ref } from 'vue'

/**
 * 为根div的一级div子元素绑定唯一ID和高度属性的Hooks
 * @param {Ref} rootRef - 根容器的ref对象（必须指向根div）
 * @param {String} idPrefix - ID前缀（可选，默认：row-item）
 * @returns {Object} 包含行信息、总高度的响应式数据和方法
 */
export function useRowInfo(
  rootRef: Ref<HTMLDivElement | null>,
  watchOptions: any,
  options?: { selector?: string },
) {
  const idPrefix = 'row-item'
  const selector = options?.selector || ':scope > div'
  // 存储一级div的信息（ID、高度、DOM元素）
  const rowList = ref<any[]>([])
  // 新增：总高度（响应式，初始值0）
  const totalHeight = ref(0)

  // 核心逻辑：处理一级div的ID和高度绑定
  const handleRowInfo = () => {
    // 容错：根容器不存在则直接返回
    if (!rootRef.value) {
      rowList.value = []
      totalHeight.value = 0 // 新增：无容器时总高度置0
      return
    }

    // 关键：获取目标元素
    const firstLevelDivs = rootRef.value.querySelectorAll(selector)
    const rows: {
      id: string
      height: number
      element: HTMLDivElement
      index: number
      html: string
      dataset: Record<string, string | undefined>
    }[] = []
    // 新增：临时变量存储总高度累加值
    let sumHeight = 0

    // 遍历每个元素，绑定ID和高度属性
    Array.from(firstLevelDivs).forEach((div: any, index: number) => {
      // 1. 绑定唯一ID（前缀+索引，方便获取）
      const rowId = `${idPrefix}-${index + 1}` // 比如 row-item-1、row-item-2
      div.id = rowId

      // 2. 读取样式：包含外边距（margin）
      const style = window.getComputedStyle(div)
      const marginTop = parseFloat(style.marginTop) || 0
      const marginBottom = parseFloat(style.marginBottom) || 0
      const rowHeight = div.offsetHeight + marginTop + marginBottom

      // 存储行信息到响应式数组
      rows.push({
        id: rowId,
        height: rowHeight,
        element: div,
        index: index + 1,
        html: div.outerHTML, // 存储 HTML 内容用于检测变化
        dataset: { ...div.dataset }, // 提取自定义属性（如 data-module）以便外部使用
      })

      // 新增：累加当前div的高度到总高度
      sumHeight += rowHeight
    })

    // 只有在数据真正发生变化时才更新，避免递归触发
    // 允许 1px 的高度误差，防止浮点数渲染抖动导致的循环
    // 同时检测 HTML 内容是否变化，确保响应式
    const isChanged =
      rows.length !== rowList.value.length ||
      rows.some((row, i) => {
        const prevRow = rowList.value[i]
        return !prevRow || Math.abs(row.height - prevRow.height) > 1 || row.html !== prevRow.html
      })

    if (isChanged) {
      rowList.value = rows
      totalHeight.value = sumHeight
    }
  }

  // 初始化：DOM挂载完成后执行一次
  onMounted(async () => {
    await nextTick()
    handleRowInfo()
  })

  // 使用 ResizeObserver 监听容器大小变化
  useResizeObserver(rootRef, () => {
    handleRowInfo()
  })

  // 使用 MutationObserver 监听内容变化（确保内容修改即使高度不变也能触发更新）
  useMutationObserver(
    rootRef,
    () => {
      handleRowInfo()
    },
    {
      childList: true, // 监听子节点增删
      subtree: true, // 监听后代节点
      characterData: true, // 监听文本变化
    },
  )

  // 监听根ref变化
  watch(
    rootRef,
    () => {
      handleRowInfo()
    },
    { immediate: false },
  )
  watch(
    watchOptions,
    () => {
      console.log(watchOptions)
      handleRowInfo()
    },
    {
      deep: true,
    },
  )

  // 对外暴露：新增 totalHeight 响应式变量
  return {
    rowList, // 响应式行信息列表（包含ID、高度、DOM元素）
    totalHeight, // 新增：所有一级div的总高度（数字，单位px）
    getRowById: (id: string) => rowList.value.find((row: { id: string }) => row.id === id), // 通过ID获取行信息
    getRowByIndex: (index: number) =>
      rowList.value.find((row: { index: number }) => row.index === index), // 通过索引获取行信息
  }
}
