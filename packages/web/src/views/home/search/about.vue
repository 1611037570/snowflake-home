<template>
  <div class="mt-3 text-center text-xs" @click="aboutVisible = true">了解搜索框功能</div>
  <SfModal v-if="aboutVisible" v-model="aboutVisible">
    <div>
      <div class="text-lg font-bold">搜索框功能介绍</div>
      <div class="mt-3">
        <div class="text-sm"></div>
        1. 搜索历史
      </div>
      <div class="text-sm">2. 搜索框功能介绍</div>
      <div class="text-sm">3. 搜索框功能介绍</div>
    </div>
  </SfModal>
</template>

<script setup>
const aboutVisible = ref(false)
</script>

<style lang="scss" scoped></style>
