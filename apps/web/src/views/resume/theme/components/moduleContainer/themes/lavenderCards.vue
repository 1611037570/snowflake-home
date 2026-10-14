<script setup>
defineProps({
  moduleKey: { type: String, default: "" }, // 模块编号
  moduleClass: { type: String, default: "" }, // 编辑器模块状态类名
});
</script>

<template>
  <!-- 模块背景只绘图，标题和条目的留白由各自节点计入测量。 -->
  <div
    class="resume-module-wrapper group group/module relative box-border flex min-w-0 flex-col"
    :class="[moduleClass, moduleKey === 'slogan' ? '' : 'rounded-[21px] bg-white/95']"
    :data-module="moduleKey"
    :style="moduleKey === 'slogan' ? undefined : { '--lavender-title-inset': '24px', '--lavender-title-top': '24px' }"
  >
    <slot name="actions" />
    <slot name="title" />
    <slot />
  </div>
</template>
