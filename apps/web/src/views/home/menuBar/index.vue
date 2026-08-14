<script setup>
import Setting from './setting.vue'
import Tip from './tip.vue'
</script>

<template>
  <div class="fixed top-12 right-12 z-20 flex items-center gap-3">
    <Tip />
    <div class="flex items-center gap-3">
      <SfTheme />
      <SfLocale />
      <Setting />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
