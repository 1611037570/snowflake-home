<script setup>
defineProps({
  moduleKey: { type: String, default: "" }, // 模块编号，供编辑器定位
  moduleClass: { type: String, default: "" }, // 模块状态类名
});
</script>

<template>
  <!-- 标题画在左侧窄栏；正文的右侧对齐由条目外框统一处理。 -->
  <div class="architect-margin-module resume-module-wrapper group group/module relative box-border flex min-w-0 flex-col" :data-module="moduleKey" :class="moduleClass">
    <slot name="actions" />
    <div class="architect-margin-title relative h-0 w-full"><slot name="title" /></div>
    <slot />
  </div>
</template>

<style>
/* 标题复用公共组件，左侧栏宽与正文条目共用区域变量。 */
.architect-margin-module [data-resume-module-title] {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--architect-rail-width);
  border-bottom: 0;
  padding-bottom: 0;
}

/* 只收起标题后的首个段落间距，让左侧标题与右侧第一行对齐。 */
.architect-margin-title + .layout-measure-record:has([data-layout-node-id$=".paragraph-spacing"]) .shrink-0,
.architect-margin-title + div:has(> .shrink-0) > .shrink-0 {
  height: 0 !important;
}
</style>
