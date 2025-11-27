import { onUnmounted, ref } from 'vue'

const useWindowSize = (cb?: any) => {
  const windowWidth = ref(0)
  const windowHeight = ref(0)

  const resize = () => {
    windowWidth.value = document.documentElement.clientWidth
    windowHeight.value = document.documentElement.clientHeight
    cb?.({
      windowWidth,
      windowHeight,
    })
  }
  resize()
  window.addEventListener('resize', resize)

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
  })
  return {
    windowWidth,
    windowHeight,
  }
}

export default useWindowSize
