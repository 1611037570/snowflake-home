<template>
  <div
    aria-hidden="true"
    class="absolute top-1/2 left-1/2 z-2 h-[526px] w-[736px] -translate-x-1/2 -translate-y-1/2 transform opacity-[0.58]"
  >
    <div
      class="relative h-full w-full overflow-hidden rounded-[34px_34px_34px_34px] bg-[#c2c966] shadow-[0_30px_80px_rgba(0,0,0,0.2)]"
    >
      <div
        class="absolute top-[182px] left-[124px] h-[146px] w-[270px] rounded-2xl bg-[#00a9a4]"
      ></div>

      <div
        class="absolute right-8 bottom-0 left-8 z-3 h-[420px] bg-[rgba(222,226,129,1)] [clip-path:polygon(0_0,50%_58%,100%_0,100%_100%,0_100%)]"
      ></div>
      <div class="absolute right-0 bottom-0 h-[420px] w-[33px] bg-[rgba(222,226,129,1)]"></div>
      <div class="absolute bottom-0 left-0 h-[420px] w-[33px] bg-[rgba(222,226,129,1)]"></div>
    </div>

    <div
      class="hero-card-rise absolute -top-16 left-[45px] z-1 h-[122px] w-[122px] rotate-[-30deg] rounded-xl bg-[#7775b8]"
    >
      <i class="absolute top-12 right-6 left-6 h-2 rounded-full bg-[rgba(235,234,203,0.64)]"></i>
      <i
        class="absolute top-[76px] right-6 left-6 h-2 rounded-full bg-[rgba(235,234,203,0.64)]"
      ></i>
    </div>
    <div
      class="hero-card-rise hero-card-rise-delay absolute top-[50px] right-12 z-1 h-[122px] w-[122px] rotate-12 rounded-xl bg-[#7775b8]"
    >
      <i class="absolute top-12 right-6 left-6 h-2 rounded-full bg-[rgba(235,234,203,0.64)]"></i>
      <i
        class="absolute top-[76px] right-6 left-6 h-2 rounded-full bg-[rgba(235,234,203,0.64)]"
      ></i>
    </div>

    <div
      class="absolute top-[16px] left-1/2 z-3 flex h-[92px] -translate-x-1/2 rotate-[-5deg] items-center gap-[18px] rounded-[18px] bg-[#e9ecef] px-7 text-[38px] font-black text-[#4d5968]"
    >
      <span>MESSAGE</span>
      <SfIcon icon="lucide:check" size="7" class="text-[#119aa5]" />
    </div>
    <div
      class="absolute right-[-142px] bottom-[126px] z-4 -rotate-12 bg-[#1886a3] p-3 px-[30px] py-4 text-[34px] font-black"
    >
      RESUME DELIVERY
    </div>
    <div
      class="hero-ray hero-ray-1 absolute top-[-84px] right-[-64px] h-20 w-6 rounded-full bg-[#008bb2]"
    ></div>
    <div
      class="hero-ray hero-ray-2 absolute top-[-60px] right-[-100px] h-24 w-6 rounded-full bg-[#008bb2]"
    ></div>
    <div
      class="hero-ray hero-ray-3 absolute top-[-12px] right-[-110px] h-24 w-6 rounded-full bg-[#008bb2]"
    ></div>
    <div
      class="hero-ray hero-ray-4 absolute top-[38px] right-[-100px] h-22 w-6 rounded-full bg-[#008bb2]"
    ></div>
    <div
      class="hero-ray hero-ray-5 absolute top-[76px] right-[-74px] h-20 w-6 rounded-full bg-[#008bb2]"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
.hero-ray {
  transform: rotate(var(--ray-rotate));
  transform-origin: center bottom;
  animation: hero-ray-rotate 0.68s cubic-bezier(0.18, 0.9, 0.24, 1.12) both;
}

.hero-card-rise {
  animation: hero-card-rise 0.58s ease-out both;
}

.hero-card-rise-delay {
  animation-delay: 0.12s;
}

.hero-ray-1 {
  --ray-rotate: 38deg;
}

.hero-ray-2 {
  --ray-rotate: 66deg;
}

.hero-ray-3 {
  --ray-rotate: 90deg;
}

.hero-ray-4 {
  --ray-rotate: 116deg;
}

.hero-ray-5 {
  --ray-rotate: 138deg;
}

@keyframes hero-ray-rotate {
  from {
    opacity: 0;
    transform: rotate(38deg) scaleY(0.72);
  }

  to {
    opacity: 1;
    transform: rotate(var(--ray-rotate)) scaleY(1);
  }
}

@keyframes hero-card-rise {
  from {
    opacity: 0;
    translate: 0 160px;
  }

  to {
    opacity: 1;
    translate: 0 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-ray,
  .hero-card-rise {
    animation: none;
  }
}
</style>
