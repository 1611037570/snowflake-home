<script setup>
import { DEFAULT_ROUTE } from '@/constants'
import { useRouter } from 'vue-router'
const router = useRouter()
const back = () => {
  router.push(DEFAULT_ROUTE)
}
</script>

<template>
  <SfIcon
    size="5"
    icon="famicons:chevron-back"
    class="cursor-pointer transition-colors hover:text-sf-theme"
    @click="back"
  />
</template>

<style lang="scss" scoped></style>
