<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

// 统一简历模块入口，复用项目标识与返回行为
const handleBack = () => {
  router.push("/resume/mine");
};
</script>

<template>
  <div
    class="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-sf-theme transition-all hover:bg-sf-theme-3"
    @click="handleBack"
  >
    <SfLogo size="5.5" class="animate-pulse" name="resume" />

    <span class="text-base font-bold tracking-wide">{{ $t("router.resume") }}</span>
  </div>
</template>
