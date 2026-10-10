<script setup>
import redFlower from "@/assets/images/redFlower.webp";
import { da_ai_xian_zun, fixed } from "@/configs";
import { ref } from "vue";

// 弹幕默认关闭，由按钮控制挂载与显示。
const barrageVisible = ref(false);
// ---------- 弹幕数据 ----------
const list = [...fixed, ...da_ai_xian_zun].map((item) => ({
  text: item.value,
}));
const sendMail = () => {
  window.location.href = `mailto:1611037570@qq.com`;
};
</script>

<template>
  <div class="minimal-thank w-dwh flex-c relative z-10 min-h-dvh flex-col gap-6 overflow-hidden bg-sf-bg px-6 pt-24 pb-9">
    <!-- 弹幕层 -->
    <div
      v-if="barrageVisible"
      id="flower-barrage"
      class="data-barrage-container absolute inset-0 z-0 overflow-hidden"
    >
      <SfBarrage :list="list" container-selector="#flower-barrage" />
    </div>
    <SfImg :src="redFlower" @click="sendMail" class="relative z-10" style="width: 168px; height: 168px" />
    <div class="relative z-10 space-y-3 text-center">
      <h2 class="text-2xl font-medium tracking-tight text-sf-base md:text-3xl">
        送你一朵小红花
      </h2>
      <p class="text-sm leading-loose text-sf-text-2">
        奖励你浏览我的主页 ^_^...
      </p>
    </div>
    <button
      type="button"
      class="relative z-10 cursor-pointer rounded-full border border-sf-b bg-sf-bg px-6 py-3 text-sm text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
      :aria-pressed="barrageVisible"
      aria-controls="flower-barrage"
      @click="barrageVisible = !barrageVisible"
    >
      {{ barrageVisible ? "关闭弹幕" : "打开弹幕" }}
    </button>
    <SfFooter
      :gap="1"
      class="relative z-10 mt-12 w-full max-w-[1080px] border-t border-sf-b pt-9 text-xs"
      :banner="false"
    />
  </div>
</template>
<style lang="scss" scoped></style>

<style scoped>
/* 用留白、细线和文字层次统一后续区域。 */

.minimal-thank { border-top: 1px solid var(--sf-border); }

</style>
