<script setup></script>

<template>
  <div class="w-dwh flex-c min-h-dvh flex-col"></div>
  <div class="w-dwh flex-c fixed inset-0 -z-1 min-h-dvh flex-col">
    <div class="sf-text-glow text-sf-text" :class="$s(18)">代码与光影的创造者</div>
    <div class="h-1 w-24 rounded-[4px] bg-sf-theme shadow-xl" :class="$s(8, 'my')"></div>
    <div class="text-sf-text-2" :class="$s(7)">用代码创造数字世界，用镜头记录美好瞬间。</div>
  </div>
</template>

<style lang="scss" scoped>
.sf-text-glow {
  text-shadow:
    0 0 18px var(--sf-theme),
    0 0 38px var(--sf-theme);
}
</style>
