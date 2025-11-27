<script setup>
import { useSearchStore } from '@/stores'
import { storeToRefs } from 'pinia'
const searchStore = useSearchStore()
const { searchFocus } = storeToRefs(searchStore)
</script>

<template>
  <div
    v-if="searchFocus"
    class="z-30 mt-3 flex w-[610px] transform flex-col rounded-2xl border border-blue-100 bg-sf-primary p-3 shadow-lg transition-all duration-300"
  ></div>
</template>

<style lang="scss" scoped></style>
