<template>
  <div class="w-dwh flex-c relative z-10 min-h-dvh"></div>
  <Background />
  <div class="fixed inset-0 z-10 flex h-dvh w-full flex-col items-center justify-center">
    <!-- 星星粒子层 -->
    <Stars />

    <!-- 内容区域 -->
    <div class="z-10 flex flex-col items-center gap-12 select-none">
      <div class="relative flex flex-col items-center gap-6">
        <div
          class="text-yyqx relative z-10 flex flex-col items-center text-center text-4xl leading-[1.6] font-black tracking-[0.2em] text-sf-base transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] md:text-7xl xl:text-8xl"
          :class="[
            showContent ? 'blur-0 translate-y-0 opacity-100' : 'translate-y-12 opacity-0 blur-md',
          ]"
          @mouseleave="isHoveredFormula = false"
        >
          <span>{{ isHoveredFormula ? "然后回到" : "我会找到" }}</span>
          <div class="inline-block py-1">
            <span v-if="!isHoveredFormula" class="unfold" @mouseenter="isHoveredFormula = true">
              <span class="text-sf-theme">逆转时间</span>的公式
            </span>
            <div v-else class="unfold flex items-center" @mouseleave="isHoveredFormula = false">
              你的<span class="text-sf-theme">身边</span>
            </div>
          </div>
        </div>
        <p
          class="text-xs font-light tracking-[0.6em] text-sf-text-2 transition-all delay-500 duration-1000 ease-out md:text-sm xl:text-base"
          :class="showContent ? 'translate-y-0 opacity-60' : 'translate-y-8 opacity-0'"
        >
          {{
            isHoveredFormula
              ? "Then I'll come back to you"
              : " I will find the formula for reversing time."
          }}
        </p>
      </div>
    </div>

    <ScrollGuide :show="showContent" />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import Background from "./background.vue";
import ScrollGuide from "./scroll-guide.vue";
import Stars from "./stars.vue";

const showContent = ref(false);
const isHoveredFormula = ref(false);

// ---------- 初始化 ----------
onMounted(() => {
  // 显示主内容
  setTimeout(() => {
    showContent.value = true;
  }, 300);
});
</script>

<style scoped>
/* 原有标题动画 */
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}
.bounce {
  display: inline-block;
  animation: bounce 1.2s ease-in-out infinite;
}

@keyframes unfold {
  0% {
    clip-path: inset(0 50% 0 50%);
  }
  100% {
    clip-path: inset(0 0% 0 0%);
  }
}
.unfold {
  display: inline-block;
  clip-path: inset(0 50% 0 50%);
  animation: unfold 0.8s ease forwards;
}
</style>
