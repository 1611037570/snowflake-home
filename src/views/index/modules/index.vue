<script setup>
import { onMounted, ref } from 'vue'

const showContent = ref(false)

onMounted(() => {
  showContent.value = true
})
function togglePlay() {
  // 获取目标元素
  console.log('about', document.getElementById('about'))
  const targetElement = document.getElementById('about')
  if (targetElement) {
    // 平滑滚动到目标元素
    targetElement.scrollIntoView({
      behavior: 'smooth', // 平滑滚动
      block: 'start', // 对齐到区块顶部
      duration: 10,
    })
  }
}
</script>

<template>
  <div class="w-dwh flex-c min-h-dvh flex-col"></div>
  <div
    class="w-dwh flex-c data-barrage-container fixed inset-0 z-10 min-h-dvh flex-col overflow-hidden"
  >
    <SfBarrage />
    <div
      class="sf-text-glow text-yyqx font-semibold text-sf-text transition-all duration-300 ease-out"
      :class="$s(22)"
      :style="{
        opacity: showContent ? 1 : 0,
        transform: showContent ? 'translateY(0)' : 'translateY(20px)',
      }"
    >
      代码与光影
    </div>
    <div
      class="h-1 w-24 rounded-full bg-sf-theme-hover shadow-xl"
      :class="$s(8, 'my')"
      :style="{ opacity: showContent ? 1 : 0, width: showContent ? '6rem' : '0' }"
    ></div>
    <div
      class="text-yyqx text-sf-text-2 transition-all duration-300 ease-out"
      :class="$s(7)"
      :style="{
        opacity: showContent ? 1 : 0,
        transform: showContent ? 'translateY(0)' : 'translateY(20px)',
      }"
    >
      用代码创造数字世界，用镜头记录美好瞬间。
    </div>
    <div class="flex-c absolute bottom-2 left-0 w-full text-sf-base">
      <SfTooltip>
        <template #content>
          <div class="flex-c items-center justify-center">继续浏览</div>
        </template>
        <SfIcon icon="mingcute:down-line" size="16" class="animate-bounce" @click="togglePlay" />
      </SfTooltip>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sf-text-glow {
  text-shadow:
    0 0 16px var(--sf-theme-hover),
    0 0 34px var(--sf-theme),
    0 0 46px var(--sf-theme);
  transition: text-shadow 0.3s ease;
}
</style>
