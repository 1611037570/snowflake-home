import type { Directive } from 'vue'
import { onMounted, onUnmounted } from 'vue'

type Event = MouseEvent | TouchEvent
const events = {
  touch: {
    start: 'touchstart',
    move: 'touchmove',
    end: 'touchend',
  },
  mouse: {
    start: 'mousedown',
    move: 'mousemove',
    end: 'mouseup',
  },
}
const mode = 'ontouchstart' in window ? 'touch' : 'mouse'

const START_EVENT: string = events[mode].start
const MOVE_EVENT: string = events[mode].move
const END_EVENT: string = events[mode].end

const defaultOptions = {
  capture: true,
}

// 初始化获取鼠标或触摸事件的坐标
const getClientPosition = (event: Event) => {
  if (event instanceof TouchEvent) {
    return {
      clientX: event.touches[0]?.clientX ?? event.changedTouches[0].clientX,
      clientY: event.touches[0]?.clientY ?? event.changedTouches[0].clientX,
    }
  } else {
    return {
      clientX: event.clientX,
      clientY: event.clientY,
    }
  }
}

// 获取手柄
const getHandle = (event: any, handle: string | string[]) => {
  if (typeof handle === 'string') {
    return event.target?.closest(handle) !== null
  }
  if (Array.isArray(handle) && handle.length > 0) {
    return handle.some((selector) => event.target?.closest(selector) !== null)
  }
}

const vMoveStart: Directive = {
  mounted(el: any, binding: any) {
    const start = (event: MouseEvent | TouchEvent) => {
      const position = getClientPosition(event)
      binding.value(event, position)
    }
    el.addEventListener('mousedown', start)
    el.addEventListener('touchstart', start)

    el._startHandler = start
  },
  unmounted(el: any) {
    console.log('112323 :>> ', 112323)
    const start = el._startHandler
    el.removeEventListener('mousedown', start)
    el.removeEventListener('touchstart', start)
  },
}
const vMove: Directive = {
  mounted(el: any, binding: any) {
    const move = (event: MouseEvent | TouchEvent) => {
      const position = getClientPosition(event)
      binding.value(event, position)
    }
    el.addEventListener('mousemove', move)
    el.addEventListener('touchmove', move)

    el._moveHandler = move
  },
  unmounted(el: any) {
    const move = el._moveHandler
    el.removeEventListener('mousemove', move)
    el.removeEventListener('touchmove', move)
  },
}

const vMoveEnd: Directive = {
  mounted(el: any, binding: any) {
    const end = (event: Event) => {
      const position = getClientPosition(event)
      binding.value(event, position)
    }
    el.addEventListener('mouseup', end)
    el.addEventListener('touchend', end)

    el._endHandler = end
  },
  unmounted(el: any) {
    const end = el._endHandler
    el.removeEventListener('mouseup', end)
    el.removeEventListener('touchend', end)
  },
}
const createDraggable = (el: any, option: any) => {
  const isDrag = ref(false)
  const startX = ref(0)
  const startY = ref(0)
  const offsetX = ref(0)
  const offsetY = ref(0)
  const draggableElement = ref()
  const { start, move, end, options = defaultOptions, handle } = option

  const endFn = (event: any) => {
    end && end(event, getClientPosition(event))
    window.removeEventListener(MOVE_EVENT, moveFn, el._options)
    window.removeEventListener(END_EVENT, endFn, el._options)
  }
  const startFn = (event: Event) => {
    if (handle && !getHandle(event, handle)) {
      return
    }

    const { clientX, clientY } = getClientPosition(event)
    startX.value = clientX
    startY.value = clientY
    offsetX.value = draggableElement.value.offsetLeft
    offsetY.value = draggableElement.value.offsetTop

    window.addEventListener(MOVE_EVENT, moveFn, el._options)
    window.addEventListener(END_EVENT, endFn, el._options)

    isDrag.value = true
    start && start(event)
  }

  const moveFn = (event: any) => {
    console.log('222222222 :>> ', 222222222)
    const { clientX, clientY } = getClientPosition(event)
    const newX = clientX - startX.value + offsetX.value
    const newY = clientY - startY.value + offsetY.value
    draggableElement.value.style.position = 'fixed'
    // 设置zindex
    draggableElement.value.style.zIndex = 9999

    draggableElement.value.style.left = newX + 'px'
    draggableElement.value.style.top = newY + 'px'
    move && move(event)
  }
  onMounted(() => {
    console.log(' document.getElementsByName(el) :>> ', document.querySelector(el))
    draggableElement.value = document.querySelector(el)
    if (!draggableElement.value) return

    draggableElement.value.addEventListener(START_EVENT, startFn)
  })

  // const handleMouseDown = (event) => {
  //   isDragging = true
  //   startX = event.clientX
  //   startY = event.clientY
  //   offsetX = draggableElement.offsetLeft
  //   offsetY = draggableElement.offsetTop
  // }

  // const handleMouseMove = (event) => {
  //   if (isDragging) {
  //     const newX = event.clientX - startX + offsetX
  //     const newY = event.clientY - startY + offsetY
  //     draggableElement.style.left = newX + 'px'
  //     draggableElement.style.top = newY + 'px'
  //   }
  // }

  // const handleMouseUp = (event) => {
  //   isDragging = false
  // }

  // draggableElement.addEventListener('mousedown', handleMouseDown)
  // document.addEventListener('mousemove', handleMouseMove)
  // document.addEventListener('mouseup', handleMouseUp)
  onUnmounted(() => {})
}

export { createDraggable, vMove }
