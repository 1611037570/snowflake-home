<script setup>
import { usePasswordStore } from '@/stores/modules/password'
const passwordStore = usePasswordStore()
const { homeModalVisible, showPassword } = storeToRefs(passwordStore)
const item = {
  name: '微信',
  password: '123456',
}
</script>

<template>
  <SfModal v-if="homeModalVisible" v-model="homeModalVisible">
    <div>明文显示：<ElSwitch v-model="showPassword" /></div>
    <ElScrollbar>
      <div>
        <div>{{ item.name }}</div>
        <div>{{ showPassword ? item.password : '******' }}</div>
      </div>
    </ElScrollbar>
  </SfModal>
</template>

<style lang="scss" scoped></style>
