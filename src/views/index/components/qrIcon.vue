<template>
  <div
    class="flex-c group relative m-3 rounded-xl p-1 transition-all duration-300 hover:scale-105 hover:bg-sf-theme"
  >
    <div
      class="absolute top-0 left-1/2 hidden -translate-x-1/2 -translate-y-[106%] flex-col items-center justify-center rounded-xl bg-sf-theme p-2 group-hover:flex"
    >
      <div class="h-16 w-16 rounded-md bg-white"></div>
      <div class="mt-2 text-[12px] text-white">{{ name }}扫码</div>
    </div>
    <SfIcon :icon="icon" :auto="false" size="6" class="" />
    <SfIcon
      icon="fa7-solid:qrcode"
      size="3"
      class="absolute! -right-0.5 -bottom-0.5 z-10 text-sf-base"
    />
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss" scoped></style>
