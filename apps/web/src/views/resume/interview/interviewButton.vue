<script setup lang="ts">
withDefaults(defineProps<{
  type?: "theme" | "bg" | "error"; // 沿用项目按钮的主操作、普通操作与危险操作类型。
}>(), {
  type: "theme", // 主操作默认使用项目主题色。
});
</script>

<template>
  <!-- 按钮保持紧凑尺寸，图标与文字始终同行，不叠加插槽间距。 -->
  <SfButton :type="type" :round="false" border
    class="inline-flex! h-9 shrink-0 whitespace-nowrap px-3! py-0! text-sm leading-6 transition-colors! hover:scale-100! active:scale-100!"
    :class="type === 'bg' ? 'bg-sf-primary! hover:bg-sf-primary! hover:border-sf-theme' : type === 'theme' ? 'border-sf-theme!' : 'border-sf-error!'">
    <span class="inline-flex items-center justify-center gap-3"><slot></slot></span>
  </SfButton>
</template>
