import { useMutationObserver, useResizeObserver } from '@vueuse/core'
import { nextTick, onMounted, ref, watch, type Ref } from 'vue'

interface RowInfo {
  id: string
  height: number
  element: HTMLElement
  index: number
  html: string
}

interface ModuleInfo {
  moduleKey: string
  rows: RowInfo[]
}

/**
 * 为根div的一级div子元素绑定唯一ID和高度属性的Hooks
 * @param rootRef - 根容器的ref对象（必须指向根div）
 * @param watchOptions - 监听选项
 * @param options - 配置选项
 * @returns 包含行信息、总高度的响应式数据
 */
export function useRowInfo(
  rootRef: Ref<HTMLDivElement | null>,
  watchOptions: any,
  options?: { selector?: string },
) {
  const idPrefix = 'row-item'
  const selector = options?.selector || '.resume-module-wrapper'

  const moduleList = ref<ModuleInfo[]>([])
  const totalHeight = ref(0)

  const getRowHeight = (div: HTMLElement): number => {
    const style = window.getComputedStyle(div)
    const marginTop = parseFloat(style.marginTop) || 0
    const marginBottom = parseFloat(style.marginBottom) || 0
    return div.offsetHeight + marginTop + marginBottom
  }

  const createRowInfo = (div: HTMLElement, moduleKey: string, index: number): RowInfo => {
    const rowId = `${idPrefix}-${moduleKey}-${index + 1}`
    div.id = rowId
    return {
      id: rowId,
      height: getRowHeight(div),
      element: div,
      index,
      html: div.outerHTML,
    }
  }

  const processModule = (
    wrapper: HTMLElement,
  ): { moduleKey: string; rows: RowInfo[]; height: number } => {
    const moduleKey = wrapper.dataset.module || ''
    const componentRoot = wrapper.children[0] as HTMLElement
    const innerDivs = componentRoot?.children || []

    const rows: RowInfo[] = []
    let height = 0

    Array.from(innerDivs).forEach((div: HTMLElement, index: number) => {
      const rowInfo = createRowInfo(div, moduleKey, index)
      rows.push(rowInfo)
      height += rowInfo.height
    })

    return { moduleKey, rows, height }
  }

  const hasModulesChanged = (newModules: ModuleInfo[]): boolean => {
    if (newModules.length !== moduleList.value.length) return true

    for (let i = 0; i < newModules.length; i++) {
      const newRows = newModules[i].rows
      const oldRows = moduleList.value[i]?.rows || []

      if (newRows.length !== oldRows.length) return true

      for (let j = 0; j < newRows.length; j++) {
        if (newRows[j].height !== oldRows[j]?.height) return true
      }
    }

    return false
  }

  const handleRowInfo = () => {
    if (!rootRef.value) {
      moduleList.value = []
      totalHeight.value = 0
      return
    }

    const wrappers = rootRef.value.querySelectorAll(selector)
    const modules: ModuleInfo[] = []
    let sumHeight = 0

    wrappers.forEach((wrapper: HTMLElement) => {
      const { moduleKey, rows, height } = processModule(wrapper)
      modules.push({ moduleKey, rows })
      sumHeight += height
    })

    if (hasModulesChanged(modules)) {
      moduleList.value = modules
      totalHeight.value = sumHeight
    }
  }

  onMounted(async () => {
    await nextTick()
    handleRowInfo()
  })

  useResizeObserver(rootRef, () => {
    handleRowInfo()
  })

  useMutationObserver(
    rootRef,
    () => {
      handleRowInfo()
    },
    {
      childList: true,
      subtree: true,
      characterData: true,
    },
  )

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
      handleRowInfo()
    },
    { deep: true },
  )

  return {
    moduleList,
    totalHeight,
  }
}
