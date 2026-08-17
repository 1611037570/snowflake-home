<template>
  <div class="relative">
    <!-- 大标题 -->
    <div class="relative mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-2">
      <span
        :class="[
          'relative inline-block bg-clip-text text-7xl leading-none font-black tracking-tighter transition-all duration-700 lg:text-8xl',
          gradient
            ? `bg-gradient-to-r ${gradient} animate-gradient text-transparent`
            : 'text-sf-theme',
        ]"
      >
        {{ title1 }}
      </span>
      <span class="text-7xl leading-none font-black tracking-tighter text-sf-text lg:text-8xl">
        {{ title2 }}
      </span>
    </div>

    <!-- 副标题 -->
    <div class="group relative mb-6 flex items-center gap-4 pl-8 md:pl-16 lg:pl-32">
      <!-- 装饰线 -->
      <span
        class="relative h-px w-10 overflow-hidden bg-sf-theme-2 transition-all duration-500 group-hover:w-14"
      >
        <span
          class="absolute inset-0 -translate-x-full bg-gradient-to-r from-sf-theme to-sf-theme-2 transition-transform duration-700 group-hover:translate-x-0"
        ></span>
      </span>

      <h1
        class="group-hover:text-sf-text-1 text-xl leading-relaxed font-medium tracking-[0.18em] text-sf-text-2 transition-colors duration-300 md:text-2xl"
      >
        {{ subtitle }}
      </h1>

      <!-- 副标题右侧点缀点 -->
      <span
        class="ml-2 h-1.5 w-1.5 rounded-full bg-sf-theme-2 opacity-0 transition-all duration-500 group-hover:scale-150 group-hover:opacity-100"
      ></span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  /**
   * 大标题渐变文字
   */
  title1: {
    type: String,
    default: "",
  },
  /**
   * 大标题普通文字
   */
  title2: {
    type: String,
    default: "",
  },
  /**
   * 副标题普通文字
   */
  subtitle: {
    type: String,
    default: "",
  },
  /**
   * 大标题渐变类名（如 from-sky-500 via-cyan-500 to-teal-500）
   */
  gradient: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 6s ease-in-out infinite;
}
</style>
