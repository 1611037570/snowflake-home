import { onMounted, onUpdated, ref, watch } from 'vue'

/**
 * 为根div的一级div子元素绑定唯一ID和高度属性的Hooks
 * @param {Ref} rootRef - 根容器的ref对象（必须指向根div）
 * @param {String} idPrefix - ID前缀（可选，默认：row-item）
 * @returns {Object} 包含行信息、总高度的响应式数据和方法
 */
export function useRowInfo(rootRef: Ref<HTMLDivElement>, idPrefix = 'row-item') {
  // 存储一级div的信息（ID、高度、DOM元素）
  const rowList: any = ref([])
  // 新增：总高度（响应式，初始值0）
  const totalHeight = ref(0)

  // 核心逻辑：处理一级div的ID和高度绑定
  const handleRowInfo = () => {
    // 容错：根容器不存在则直接返回
    if (!rootRef.value) {
      rowList.value = []
      totalHeight.value = 0 // 新增：无容器时总高度置0
      console.warn('根容器ref不存在，请检查ref绑定')
      return
    }

    // 关键：仅获取根容器下的一级div（> div 选择器限定直接子元素，不递归）
    const firstLevelDivs = rootRef.value.querySelectorAll('> div')
    const rows: { id: string; height: string; element: HTMLDivElement; index: number }[] = []
    // 新增：临时变量存储总高度累加值
    let sumHeight = 0

    // 遍历每个一级div，绑定ID和高度属性
    Array.from(firstLevelDivs).forEach((div: any, index: number) => {
      // 1. 绑定唯一ID（前缀+索引，方便获取）
      const rowId = `${idPrefix}-${index + 1}` // 比如 row-item-1、row-item-2
      div.id = rowId

      // 2. 读取div的视觉高度（offsetHeight 包含padding/border，贴合实际显示高度）
      const rowHeight = div.offsetHeight

      // 存储行信息到响应式数组
      rows.push({
        id: rowId,
        height: rowHeight,
        element: div,
        index: index + 1,
      })

      // 新增：累加当前div的高度到总高度
      sumHeight += rowHeight
    })

    rowList.value = rows
    // 新增：把累加的总高度赋值给响应式变量
    totalHeight.value = sumHeight
  }

  // 初始化：DOM挂载完成后执行一次
  onMounted(async () => {
    await nextTick()
    handleRowInfo()
  })

  // 更新：DOM更新后重新计算（比如数据变化导致div高度/数量变化）
  onUpdated(() => {
    handleRowInfo()
  })

  // 监听根ref变化（可选，防止ref动态绑定）
  watch(
    rootRef,
    () => {
      handleRowInfo()
    },
    { immediate: false },
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
