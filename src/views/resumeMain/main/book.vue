<template>
  <div class="hero-book absolute bottom-0 left-0 z-2 h-[600px]">
    <div
      class="absolute top-15 bottom-2 left-[100px] w-[140px] rounded-[0_18px_18px_0] bg-[rgba(47,60,70,1)] shadow-[22px_28px_52px_rgba(0,0,0,0.22)]"
    ></div>
    <div class="absolute top-20 bottom-6 left-20 w-[130px] rounded-xl bg-sf-theme-hover"></div>
    <div
      class="absolute bottom-0 left-0 flex h-[550px] w-[180px] items-end justify-center rounded-[0_18px_18px_0] bg-[#75878a] pb-[120px] shadow-[22px_28px_52px_rgba(0,0,0,0.22)]"
    ></div>
    <div
      class="absolute right-0 bottom-[150px] left-0 z-1 flex h-[78px] w-[210px] items-center justify-end bg-[linear-gradient(90deg,#24324b,#00c5b8)] p-3 text-[34px] font-black"
    >
      RESUME
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hero-book {
  animation: hero-slide-right 0.82s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

@keyframes hero-slide-right {
  from {
    opacity: 0;
    transform: translateX(-72px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-book {
    animation: none;
  }
}
</style>
