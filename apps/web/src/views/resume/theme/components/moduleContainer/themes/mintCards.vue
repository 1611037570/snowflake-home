<script setup>
defineProps({
  moduleKey: { type: String, default: "" }, // 模块编号
  moduleClass: { type: String, default: "" }, // 编辑器模块状态类名
});
// 标题节点自行承担卡片内留白，外框不增加测量预算。
const titleInsetStyle = {
  "--mint-title-inset": "21px", // 标题左右留白
  "--mint-title-top": "21px", // 标题上方留白
};
</script>

<template>
  <!-- 卡片外框只绘制底色、圆角和轻阴影，留白由标题与条目节点承担。 -->
  <div
    class="resume-module-wrapper group group/module relative box-border flex min-w-0 flex-col"
    :class="[moduleClass, moduleKey === 'slogan' ? '' : 'rounded-[18px] bg-white shadow-[inset_0_0_0_1px_#D8F2EB,0_12px_28px_rgba(33,137,121,0.08)]']"
    :data-module="moduleKey"
    :style="moduleKey === 'slogan' ? undefined : titleInsetStyle"
  >
    <slot name="actions" />
    <slot name="title" />
    <slot />
  </div>
</template>
