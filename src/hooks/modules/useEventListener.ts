import { onMounted, onUnmounted, isRef, watch } from 'vue'

export function useEventListener<T extends EventTarget>(
  target: T | Ref<T | null | undefined> | (() => T | null | undefined),
  event: string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
) {
  // 获取当前目标元素的函数
  const getCurrentTarget = () => {
    if (isRef(target)) {
      return target.value
    } else if (typeof target === 'function') {
      return target()
    }
    return target
  }

  // 事件监听的添加和移除逻辑
  let currentTarget: T | null | undefined = null

  const setupEventListener = () => {
    // 首先移除可能存在的监听器
    cleanupListener()

    // 获取当前目标并添加监听器
    currentTarget = getCurrentTarget()
    if (currentTarget) {
      currentTarget.addEventListener(event, handler, options)
    }
  }

  const cleanupListener = () => {
    if (currentTarget) {
      currentTarget.removeEventListener(event, handler, options)
      currentTarget = null
    }
  }

  // 根据目标类型设置不同的监听方式
  if (isRef(target)) {
    // 当目标是ref时，监听其变化
    watch(target, setupEventListener, { immediate: true })
  } else {
    // 对于固定目标或函数目标，在组件挂载时设置
    onMounted(setupEventListener)
  }

  // 组件卸载时清理监听器
  onUnmounted(cleanupListener)
}
