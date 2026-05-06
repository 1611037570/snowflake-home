<script setup>
import nnLogo from '@/assets/images/userLogo.png'

defineProps({
  size: {
    type: String,
    default: '7.5',
  },
})
</script>

<template>
  <SfImg
    :src="nnLogo"
    class="transition-all duration-600 hover:rotate-90"
    fit="contain"
    :size="size"
  />
</template>

<style lang="scss" scoped></style>
