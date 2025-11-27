import { ref } from 'vue'
import { ElMessage } from 'element-plus'

/**
 * 复制文本到剪贴板的Hook
 * 仅支持现代浏览器，使用Navigator.clipboard API
 * @returns 包含复制方法和复制状态的对象
 */
export function useClipboard() {
  // 复制成功状态
  const isCopied = ref(false)
  // 复制错误信息
  const error = ref<string | null>(null)

  /**
   * 复制文本到剪贴板
   * @param text 要复制的文本内容
   * @returns Promise<boolean> 复制是否成功
   */
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      // 重置状态
      isCopied.value = false
      error.value = null

      // 使用现代的Clipboard API
      await navigator.clipboard.writeText(text)

      // 设置复制成功状态
      isCopied.value = true

      // 使用Element Plus的成功消息提示
      ElMessage({
        message: '复制成功',
        type: 'success',
        duration: 3000,
      })

      // 3秒后重置复制成功状态，方便用户进行多次复制操作
      setTimeout(() => {
        isCopied.value = false
      }, 3000)

      return true
    } catch (err) {
      // 捕获并记录错误
      const errorMessage = err instanceof Error ? err.message : '复制失败'
      error.value = errorMessage

      // 使用Element Plus的错误消息提示
      ElMessage({
        message: errorMessage,
        type: 'error',
        duration: 3000,
      })

      console.error('复制到剪贴板失败:', err)
      return false
    }
  }

  /**
   * 重置复制状态
   */
  const reset = () => {
    isCopied.value = false
    error.value = null
  }

  return {
    copyToClipboard,
    isCopied,
    error,
    reset,
  }
}
