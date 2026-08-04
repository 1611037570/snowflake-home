<template>
  <img
    :src="settingIcon"
    style="width: 40px; height: 40px"
    class="rounded-lg"
    fit="cover"
    @click="openSet"
  />
</template>

<script setup>
import settingIcon from '@/assets/images/setting.png'
import { useHomeStore } from '@/stores'
import { storeToRefs } from 'pinia'
const homeStore = useHomeStore()
const { systemVisible } = storeToRefs(homeStore)
const openSet = () => {
  systemVisible.value = true
}
</script>

<style lang="scss" scoped></style>
