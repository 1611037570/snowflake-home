<script setup>
import { computed, inject } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
})

const fontValue = inject('fontValue')
const lineHeightValue = inject('lineHeightValue')

function hasContent(content) {
  if (!content) {
    return false
  }
  if (content == '<p><br></p>') {
    return false
  }
  return true
}

// 将内容按块拆分，以便分页逻辑可以更细粒度地处理
const splitBlocks = computed(() => {
  if (!props.content) return []
  // 匹配常见的块级标签或换行符
  // 这里采用正则匹配的方式，将 <p>...</p> 或 <div>...</div> 或 <br> 作为独立块
  const blocks = props.content.match(/<p>[\s\S]*?<\/p>|<div[\s\S]*?<\/div>|<br\s*\/?>|[^<]+/gi)
  if (!blocks) return [props.content]
  return blocks.filter((block) => block.trim() && block !== '<p><br></p>')
})
</script>

<template>
  <template v-if="hasContent(content)">
    <div class="mt-1 w-full"></div>
    <div
      v-for="(block, idx) in splitBlocks"
      :key="idx"
      class="whitespace-pre-wrap"
      :style="[fontValue(-3), lineHeightValue(-3)]"
      v-html="block"
    ></div>
  </template>
</template>

<style lang="scss" scoped></style>
