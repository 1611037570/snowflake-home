<script setup>
const visible = ref(false);
</script>

<template>
  <div>
    <div @click="visible = true">用户协议</div>
    <SfModal v-model="visible"></SfModal>
  </div>
</template>

<style lang="scss" scoped></style>
