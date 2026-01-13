<script setup>
import { useShortcutStore } from '@/stores'
import SearchTitle from '../searchTitle.vue'
const shortcutStore = useShortcutStore()
const { fixedList } = storeToRefs(shortcutStore)
function handleClick(item) {
  urlNavigation(item.url)
}
</script>

<template>
  <SearchTitle title="已固定" icon="tabler:history" iconClass="text-sf-theme" />
  <div class="grid grid-cols-8 gap-4">
    <div
      @click="handleClick(item)"
      v-for="item in fixedList"
      :key="item.id"
      class="flex-c cursor-pointer flex-col overflow-hidden rounded-xl bg-white/80 p-2 text-sm text-sf-text backdrop-blur-sm hover:bg-sf-theme-hover"
    >
      <SfMixImg :type="item.imgType" :value="item.imgValue" :size="24" />
      <!-- <div class="mt-2 w-full truncate px-1 text-center text-xs">{{ item.name }}</div> -->
    </div>
  </div>
</template>
<style scoped></style>
