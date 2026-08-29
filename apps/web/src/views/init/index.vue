<script setup>
import { onMounted } from "vue";
import { showBrowserTip } from "@/components/business/browserTip";
import StepSelectRoute from "./StepSelectRoute.vue";

onMounted(() => {
  // 非推荐浏览器时提示，并给出推荐浏览器下载入口
  showBrowserTip();
});
</script>

<template>
  <div class="flex min-h-dvh w-full flex-col items-center justify-center bg-sf-bg p-4 text-sf-base">
    <div class="flex w-full max-w-2xl items-center justify-end gap-5">
      <SfTheme />
      <SfLocale />
      <SfDonation />
      <SfSetting />
    </div>
    <div class="flex w-full max-w-2xl flex-1 flex-col items-center justify-center">
      <StepSelectRoute />
    </div>
    <SfFooter class="text-xs" />
  </div>
</template>

<style lang="scss" scoped></style>
