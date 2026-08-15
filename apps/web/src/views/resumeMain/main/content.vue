<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
function handleCreate() {
  router.push(`/resumeMain?type=template&t=${Date.now()}`);
}
</script>

<template>
  <div class="hero-copy relative z-4 flex flex-col items-center gap-2 text-[78px] font-black">
    <div class="text-sf-theme-text drop-shadow-[0_10px_28px_rgba(0,0,0,0.22)]">以此简历</div>
    <div class="text-sf-theme-text not-italic">渡你过万重山</div>
    <div
      class="hero-cta mt-3 flex h-[58px] w-[168px] cursor-pointer items-center justify-center rounded-full border-0 bg-sf-theme text-[22px] font-black text-sf-theme-text shadow-lg shadow-sf-theme/25 transition-all duration-200 hover:-translate-y-0.5"
      @click="handleCreate"
    >
      立即制作
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hero-copy {
  animation: hero-copy-rise 0.58s 0.42s ease-out both;
}

@keyframes hero-copy-rise {
  from {
    opacity: 0;
    filter: blur(8px);
    translate: 0 18px;
  }

  to {
    opacity: 1;
    filter: blur(0);
    translate: 0 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-copy {
    animation: none;
  }
}
</style>
