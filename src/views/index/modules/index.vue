<script setup></script>

<template>
  <div class="w-dwh flex-c min-h-dvh flex-col"></div>
  <div class="w-dwh flex-c fixed inset-0 -z-1 min-h-dvh flex-col">
    <div class="sf-text-glow text-sf-text transition-all duration-300" :class="$s(18)">
      代码与光影的创造者
    </div>
    <div class="mt-8 mb-6 h-1 w-24 rounded-[4px] bg-sf-theme shadow-xl"></div>
    <div class="text-lg text-sf-text-2">用代码创造数字世界，用镜头记录美好瞬间。</div>
  </div>
</template>

<style lang="scss" scoped>
.sf-text-glow {
  text-shadow:
    0 0 18px var(--sf-theme),
    0 0 38px var(--sf-theme);
}
</style>
