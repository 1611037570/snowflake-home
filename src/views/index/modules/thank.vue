<script setup>
import redFlower from '@/assets/images/redFlower.jpg'
const sendMail = () => {
  window.location.href = `mailto:1611037570@qq.com`
}
</script>

<template>
  <div class="w-dwh flex-c relative z-10 min-h-dvh flex-col gap-5 bg-sf-primary py-20">
    <SfImg :src="redFlower" @click="sendMail" style="width: 228px; height: 228px" />
    <div class="space-y-3">
      <h2 class="text-3xl font-bold tracking-wider text-sf-text drop-shadow-sm md:text-4xl">
        送你一朵小红花
      </h2>
      <p class="text-lg font-light tracking-wide text-sf-text-2 md:text-xl">
        奖励你浏览我的主页 ^_^...
      </p>
    </div>
    <SfFooter
      :gap="1"
      class="absolute bottom-full z-10 w-full bg-sf-bg pt-2 text-[14px] md:text-[16px]"
      :banner="false"
    />
  </div>
</template>
<style lang="scss" scoped></style>
