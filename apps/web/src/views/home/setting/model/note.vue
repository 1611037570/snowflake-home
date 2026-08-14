<script setup>
import { useNoteStore } from '@/stores'
const noteStore = useNoteStore()
const { autoCollapse } = storeToRefs(noteStore)
</script>

<template>
  <sf-set-box>
    <sf-set-item title="置顶自动收缩" type="switch" v-model="autoCollapse" />
  </sf-set-box>
</template>

<style lang="scss" scoped></style>
