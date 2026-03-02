<script setup>
import { inject } from 'vue'

defineProps({
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
</script>

<template>
  <div
    v-if="hasContent(content)"
    class="whitespace-pre-wrap"
    :style="[fontValue(), lineHeightValue()]"
    v-html="content"
  ></div>
</template>

<style lang="scss" scoped></style>
