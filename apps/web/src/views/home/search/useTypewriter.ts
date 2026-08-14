import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 循环打字机效果组合式函数
 * @param {Object} options 配置项
 * @param {string} options.text 目标文本
 * @param {number} [options.typeSpeed=150] 打字速度(ms)
 * @param {number} [options.deleteSpeed=80] 删除速度(ms)
 * @param {number} [options.pauseAfterType=1500] 打完后停顿时间(ms)
 * @param {number} [options.pauseAfterDelete=800] 删除后停顿时间(ms)
 * @returns {Object} { placeholder: 响应式占位符值 }
 */
export function useTypewriter({
  text = '',
  typeSpeed = 150,
  deleteSpeed = 80,
  pauseAfterType = 1500,
  pauseAfterDelete = 800,
}) {
  // 状态管理
  const placeholder = ref('')
  let currentIndex = 0
  let isDeleting = false
  let timer: number | null = null
  let timeoutId: number | null = null

  // 清除所有定时器
  const clearTimers = () => {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  // 启动打字机效果
  const startTypewriter = () => {
    // 获取当前速度
    const currentSpeed = isDeleting ? deleteSpeed : typeSpeed

    timer = window.setInterval(() => {
      if (!isDeleting) {
        // 打字阶段
        placeholder.value += text[currentIndex++]
        // 完成打字，准备删除
        if (currentIndex >= text.length) {
          isDeleting = true
          clearTimers()
          timeoutId = window.setTimeout(startTypewriter, pauseAfterType)
        }
      } else {
        // 删除阶段
        placeholder.value = text.substring(0, currentIndex--)
        // 完成删除，准备重新开始
        if (currentIndex < 0) {
          isDeleting = false
          currentIndex = 0
          clearTimers()
          timeoutId = window.setTimeout(startTypewriter, pauseAfterDelete)
        }
      }
    }, currentSpeed)
  }

  // 组件挂载时启动
  onMounted(() => {
    startTypewriter()
  })

  // 组件卸载时清理
  onUnmounted(() => {
    clearTimers()
  })

  return placeholder
}
