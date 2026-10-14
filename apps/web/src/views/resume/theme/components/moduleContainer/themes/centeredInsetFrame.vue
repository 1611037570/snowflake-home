<script setup>
defineProps({
  moduleKey: { type: String, default: "" }, // 当前模块编号
  moduleClass: { type: String, default: "" }, // 编辑器模块状态类名
});
</script>

<template>
  <!-- 线框覆盖模块标题与正文，不额外改变分页盒子的尺寸。 -->
  <div class="resume-module-wrapper group group/module relative box-border flex min-w-0 flex-col" :class="moduleClass" :data-module="moduleKey">
    <span aria-hidden="true" class="pointer-events-none absolute inset-0 border border-[#666666]" />
    <slot name="actions" />
    <slot name="title" />
    <slot />
  </div>
</template>
