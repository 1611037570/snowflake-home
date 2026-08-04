<template>
  <div class="z-10 mb-3 cursor-pointer text-5xl font-bold text-sf-primary" @click="updateTab">
    <span>
      {{ time }}
    </span>
  </div>
</template>

<script setup>
import { useCurrentTime } from '@/hooks'
import { useHomeStore, useSearchStore } from '@/stores'
const searchStore = useSearchStore()
const { searchFocus } = storeToRefs(searchStore)

const homeStore = useHomeStore()
const { time } = useCurrentTime()
const { switchTab } = homeStore

const updateTab = () => {
  if (searchFocus.value) {
    return
  }
  switchTab()
}
</script>

<style lang="scss" scoped></style>
