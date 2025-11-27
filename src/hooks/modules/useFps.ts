import { ref, onUnmounted } from 'vue'
import { useRafFn, useNow } from '@vueuse/core'

interface UseFpsOptions {
  /**
   * 采样间隔，单位毫秒
   * @default 1000
   */
  sampleInterval?: number
  /**
   * 是否立即开始监控
   * @default true
   */
  immediate?: boolean
}

/**
 * 实时获取当前 FPS (每秒帧数)
 */
export function useFps(options: UseFpsOptions = {}) {
  const { sampleInterval = 1000, immediate = true } = options

  const fps = ref(0)
  const lastSampleTime = ref(0)
  const frameCount = ref(0)
  const isActive = ref(immediate)

  const { now } = useNow({ controls: true })

  const { pause, resume } = useRafFn(
    () => {
      frameCount.value++

      const currentTime = now.value
      const elapsed = currentTime - lastSampleTime.value

      // 达到采样间隔时计算 FPS
      if (elapsed >= sampleInterval) {
        fps.value = Math.round((frameCount.value * 1000) / elapsed)

        // 重置计数器和时间
        frameCount.value = 0
        lastSampleTime.value = currentTime
      }
    },
    { immediate: false },
  )

  // 初始化采样时间
  lastSampleTime.value = now.value

  // 控制监控状态
  const start = () => {
    if (!isActive.value) {
      isActive.value = true
      lastSampleTime.value = now.value
      frameCount.value = 0
      resume()
    }
  }

  const stop = () => {
    if (isActive.value) {
      isActive.value = false
      pause()
    }
  }

  const toggle = () => {
    if (isActive.value) {
      stop()
    } else {
      start()
    }
  }

  // 根据 immediate 选项初始状态
  if (immediate) {
    resume()
  }

  // 组件卸载时自动停止
  onUnmounted(() => {
    stop()
  })

  return {
    fps: fps,
    isActive: isActive,
    start,
    stop,
    toggle,
  }
}
