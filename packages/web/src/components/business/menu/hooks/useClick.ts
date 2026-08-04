import { onMounted, onUnmounted, ref } from 'vue'
const useClick = (el: any, type: string, cb: any) => {
  const clientX = ref(0)
  const clientY = ref(0)
  const start = (event: MouseEvent) => {
    clientX.value = event.clientX
    clientY.value = event.clientY
    cb(event, {
      clientX,
      clientY,
    })
  }

  const pressTime = ref()
  const down = (event: MouseEvent) => {
    clearTimeout(pressTime.value)
    pressTime.value = setTimeout(() => {
      start(event)
    }, 500)
  }

  const up = () => {
    clearTimeout(pressTime.value)
  }
  onMounted(() => {
    if (type == 'press') {
      el.value?.addEventListener('mousedown', down)
      el.value?.addEventListener('mouseup', up)
    } else {
      el.value?.addEventListener(type, start)
      el.value?.addEventListener(type, start)
    }
  })

  onUnmounted(() => {
    if (type == 'press') {
      el.value?.removeEventListener('mousedown', down, { capture: true })
      el.value?.removeEventListener('mouseup', up, { capture: true })
    } else {
      el.value?.removeEventListener(type, start, { capture: true })
      el.value?.removeEventListener(type, start, { capture: true })
    }
  })

  return {
    clientX,
    clientY,
  }
}

export default useClick
