<script setup>
import { defineAsyncComponent, computed } from 'vue'

// 定义属性，接收 key 参数
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
})

/**
 * 使用 Vite 的 import.meta.glob 动态导入当前目录下的所有 .vue 组件
 * 排除当前 index.vue 文件自身
 */
const components = import.meta.glob('./*.vue')

/**
 * 根据传入的 name 动态计算并加载对应的组件
 */
const dynamicComponent = computed(() => {
  const filePath = `./${props.name}.vue`

  // 检查请求的组件是否存在于导入的模块中
  if (components[filePath]) {
    return defineAsyncComponent(components[filePath])
  }

  console.warn(`[ResumePreview] 组件 ${props.name} 不存在于目录中`)
  return null
})
</script>

<template>
  <!-- 渲染动态组件，并透传所有属性和事件 -->
  <component :is="dynamicComponent" v-if="dynamicComponent" v-bind="$attrs" />
</template>

<style lang="scss" scoped></style>
