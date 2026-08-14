<script setup>
// 定义组件 Props
defineProps({
  // 是否显示内容
  show: {
    type: Boolean,
    default: false,
  },
});

/**
 * 滚动到关于区域
 */
function scrollToAbout() {
  const targetElement = document.getElementById("about");
  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}
</script>

<template>
  <!-- 底部引导 -->
  <div
    class="group absolute bottom-8 z-20 flex cursor-pointer flex-col items-center gap-4 transition-all delay-1000 duration-1000"
    :class="show ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
    @click="scrollToAbout"
  >
    <span
      class="text-xs tracking-[0.4em] text-sf-text-3 uppercase opacity-60 group-hover:text-sf-theme"
    >
      Scroll
    </span>
    <SfIcon
      icon="mingcute:down-line"
      size="24"
      class="animate-bounce cursor-pointer text-sf-text-2 transition-all duration-300 group-hover:scale-125 group-hover:text-sf-theme"
    />
  </div>
</template>

<style scoped>
/* 增加更细腻的动画曲线 */
.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
</style>
