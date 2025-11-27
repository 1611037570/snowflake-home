<template>
  <sf-icon
    icon="iconamoon:settings-fill"
    size="8"
    class="text-sf-base transition-all duration-200 hover:rotate-180"
    @click="openSet"
  />
</template>

<script setup>
import { useHomeStore } from '@/stores'
import { storeToRefs } from 'pinia'

const homeStore = useHomeStore()
const { systemVisible } = storeToRefs(homeStore)
const openSet = () => {
  systemVisible.value = true
}
</script>

<style lang="scss" scoped></style>
