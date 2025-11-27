<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import MenuList from './MenuList.vue'
import useClick from './hooks/useClick'
import useWindowSize from './hooks/useWindowSize'
import type { MenuEmits, MenuProps } from './types'
// emit 事件
const emit = defineEmits<MenuEmits>()
// props 数据
const {
  list = () => [
    {
      name: '下班',
      fn: () => {
        console.log('我到点下班啦！~ ')
      },
    },
    {
      name: '吃啥',
      fn: () => {
        console.log('这餐吃炸鸡~ ')
      },
    },
  ],
  model = 'contextmenu',
  stopPropagation = true,
  preventDefault = true,
  beforeCreateFn = () => true,
  menuContainerStyle = {},
  nameKey = 'name',
  fnKey = 'fn',
} = defineProps<MenuProps>()

// 菜单元素
const menuContainer = useTemplateRef('menuContainer')
const { windowWidth, windowHeight } = useWindowSize()
// 菜单大小
const menuWidth = ref(0)
const menuHeight = ref(0)

const open = ref(false)

const down = (event: any) => {
  // 阻止事件冒泡
  if (stopPropagation) {
    event.stopPropagation()
  }
  // 阻止默认事件
  if (preventDefault) {
    event.preventDefault()
  }

  if (list.length === 0) return
  // 打开前回调
  emit('onBeforeCreate')
  //打开前事件
  if (!beforeCreateFn()) {
    return
  }
  open.value = true
  // 打开后回调
  emit('onMounted')
  window.addEventListener('click', end, { capture: true })
  window.addEventListener('contextmenu', end, { capture: true })
}
const { clientX, clientY } = useClick(menuContainer, model, down)
const select = (item: any) => {
  // 触发点击绑定事件
  item[fnKey]?.()
  // 选中后回调
  emit('onSelected', item)
  end()
}

const end = () => {
  // 关闭前回调
  emit('onBeforeUnmount')

  open.value = false

  // 关闭后回调
  emit('onUnmounted')
  // // 关闭事件
  // window.removeEventListener('mousedown', end, {
  //   capture: true,
  // })
  window.removeEventListener('click', end, { capture: true })
  window.removeEventListener('contextmenu', end, { capture: true })
}

const menuPositron = computed(() => {
  const mW = menuWidth.value
  const cX = clientX.value
  const mH = menuHeight.value
  const cY = clientY.value

  const positionStyle: any = {}

  if (cX > windowWidth.value - mW) {
    positionStyle.right = `${windowWidth.value - cX}px`
    positionStyle.transformOrigin = 'right'
  } else {
    positionStyle.left = `${cX}px`
    positionStyle.transformOrigin = 'left'
  }

  if (cY > windowHeight.value - mH) {
    positionStyle.bottom = `${windowHeight.value - cY}px`
    positionStyle.transformOrigin += ' bottom'
  } else {
    positionStyle.top = `${cY}px`
    positionStyle.transformOrigin += ' top'
  }

  return positionStyle
})
</script>

<template>
  <!-- 触发展开区 -->
  <div ref="menuContainer">
    <slot></slot>
    <!-- 菜单展示区 -->
    <Teleport to="body">
      <transition
        mode="out-in"
        enter-active-class="transition-all duration-200 linear"
        leave-active-class="transition-all duration-200 linear"
        enter-from-class="scale-0"
        leave-to-class="scale-0"
      >
        <MenuList
          v-if="list.length && open"
          class="fixed z-999999999 overflow-hidden"
          :style="[menuPositron, menuContainerStyle]"
          :list="list"
          :nameKey="nameKey"
          @select="select"
        ></MenuList>
      </transition>
    </Teleport>
  </div>
</template>
<style scoped></style>
