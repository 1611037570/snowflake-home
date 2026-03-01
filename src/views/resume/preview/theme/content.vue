<script setup>
defineProps({
  content: {
    type: String,
    default: '',
  },
})
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
    class="text-sf-desc mb-3 text-sm whitespace-pre-wrap"
    v-html="content"
  ></div>
</template>

<style lang="scss" scoped></style>
