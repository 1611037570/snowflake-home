<template>
  <div class="flex-c min-h-screen flex-col gap-6 bg-sf-bg">
    <!-- 错误图标 -->
    <SfIcon icon="solar:danger-triangle-bold-duotone" class="text-sf-error" />

    <div class="flex-c flex-col gap-2">
      <!-- 错误提示 -->
      <div class="text-2xl font-bold text-sf-text">{{ $t("error.loadFailed") }}</div>
      <!-- 倒计时提示 -->
      <div class="text-sm text-sf-text-2">{{ $t("error.autoRedirect", { count }) }}</div>
    </div>

    <!-- 跳转按钮 -->
    <button
      class="sf-theme-element rounded-lg px-8 py-2.5 text-sm font-medium shadow-sm transition-all hover:opacity-90 active:scale-95"
      @click="jump"
    >
      {{ $t("error.redirectNow") }}
    </button>
  </div>
</template>

<script setup>
import { DEFAULT_ROUTE } from "@/constants";
import { useIntervalFn } from "@vueuse/core";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const count = ref(3);

// 跳转到默认路由
function jump() {
  router.push(DEFAULT_ROUTE);
}

// 倒计时逻辑
const { pause, resume } = useIntervalFn(() => {
  count.value -= 1;

  if (count.value <= 0) {
    pause();
    jump();
  }
}, 1000);

onMounted(() => {
  resume();
});
</script>

<style scoped></style>
