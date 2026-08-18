<script setup>
import redFlower from "@/assets/images/redFlower.jpg";
import { da_ai_xian_zun, fixed } from "@/configs";
// ---------- 弹幕数据 ----------
const list = [...fixed, ...da_ai_xian_zun].map((item) => ({
  text: item.value,
}));
const sendMail = () => {
  window.location.href = `mailto:1611037570@qq.com`;
};
</script>

<template>
  <div class="w-dwh flex-c relative z-10 flex-col gap-5 bg-sf-bg py-20">
    <!-- 弹幕层 -->
    <div
      v-if="0"
      class="data-barrage-container absolute inset-0 z-2 overflow-hidden transition-opacity duration-1000"
    >
      <SfBarrage :list="list" />
    </div>
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
      class="absolute bottom-full z-10 w-full pt-2 text-[14px] md:text-[16px]"
      :banner="false"
    />
  </div>
</template>
<style lang="scss" scoped></style>
