<template>
  <SfModal v-if="loginVisible" v-model="loginVisible">
    <PrivacyAuthorization />
  </SfModal>
</template>

<script setup>
import { useUserStore } from '@/stores'
import PrivacyAuthorization from './privacyAuthorization.vue'

const userStore = useUserStore()
const { loginVisible } = storeToRefs(userStore)
</script>

<style lang="scss" scoped></style>
