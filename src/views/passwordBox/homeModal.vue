<script setup>
import { usePasswordStore } from '@/stores/modules/password'
import PasswordBox from './passwordBox.vue'
const passwordStore = usePasswordStore()
const { homeModalVisible } = storeToRefs(passwordStore)
</script>

<template>
  <SfModal v-if="homeModalVisible" v-model="homeModalVisible">
    <PasswordBox />
  </SfModal>
</template>

<style lang="scss" scoped></style>
