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
  const selector = options?.selector || '.resume-module-wrapper'

  // 存储所有模块的行信息
  const moduleList = ref<any[]>([])
  const totalHeight = ref(0)

  const handleRowInfo = () => {
    if (!rootRef.value) {
      moduleList.value = []
      totalHeight.value = 0
      return
    }

    const wrappers = rootRef.value.querySelectorAll(selector)
    const modules: any[] = []
    let sumHeight = 0
    let hasChanged = false

    wrappers.forEach((wrapper: any) => {
      const moduleKey = wrapper.dataset.module

      // 获取实际的 1, 2, 3 div
      // 根据要求，组件内部结构为 <div><div>1</div><div>2</div><div>3</div></div>
      // 所以 wrapper 的第一个子元素就是组件的根 div，它的 children 就是 1, 2, 3
      const componentRoot = wrapper.children[0]
      const innerDivs = componentRoot ? componentRoot.children : []

      const rows: any[] = []
      Array.from(innerDivs).forEach((div: any, index: number) => {
        const rowId = `${idPrefix}-${moduleKey}-${index + 1}`
        div.id = rowId

        const style = window.getComputedStyle(div)
        const marginTop = parseFloat(style.marginTop) || 0
        const marginBottom = parseFloat(style.marginBottom) || 0
        const rowHeight = div.offsetHeight + marginTop + marginBottom

        rows.push({
          id: rowId,
          height: rowHeight,
          element: div,
          index, // 0-based
          html: div.outerHTML,
        })
        sumHeight += rowHeight
      })

      modules.push({
        moduleKey,
        rows,
      })
    })

    // 简单检测是否变化
    if (
      JSON.stringify(modules.map((m) => m.rows.map((r) => r.height))) !==
      JSON.stringify(moduleList.value.map((m) => m.rows.map((r) => r.height)))
    ) {
      hasChanged = true
    }

    if (hasChanged || moduleList.value.length !== modules.length) {
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
