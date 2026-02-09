<template>
  <div
    class="fixed inset-0 z-10 min-h-dvh w-full"
    style="background-image: radial-gradient(var(--sf-base) 1px, var(--sf-primary) 1px)"
  >
    <!-- 背景装饰元素 -->
    <div class="bg-blur bg-1" :class="[$s(100, 'w'), $s(100, 'h')]"></div>
    <div class="bg-blur bg-2" :class="[$s(60, 'w'), $s(60, 'h')]"></div>
    <div class="bg-blur bg-3" :class="[$s(80, 'w'), $s(80, 'h')]"></div>
  </div>
</template>
<style lang="scss" scoped>
/* 装饰性背景元素 */
.bg-blur {
  position: absolute;
  animation: float 12s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.7;
  z-index: 100;
}

.bg-1 {
  background: #7c3aed;
  top: 10%;
  left: 5%;
}

.bg-2 {
  background: #10b981;
  bottom: 1%;
  right: 5%;
}

.bg-3 {
  background: #f59e0b;
  bottom: 24%;
  right: 16%;

  animation-delay: 1s;
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-80px) translateX(60px);
  }
  50% {
    transform: translateY(0) translateX(120px);
  }
  75% {
    transform: translateY(80px) translateX(60px);
  }
}
</style>
