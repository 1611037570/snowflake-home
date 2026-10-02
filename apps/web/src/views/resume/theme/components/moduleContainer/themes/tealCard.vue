<script setup>
defineProps({
  moduleKey: { type: String, default: "" }, // 模块标识，供编辑定位
  moduleClass: { type: String, default: "" }, // 模块编辑状态类名
});
</script>

<template>
  <!-- 标题位于卡片外，同一模块当前页的全部条目共用一个卡片。 -->
  <div
    class="resume-module-wrapper group group/module relative box-border flex min-w-0 flex-col"
    :data-module="moduleKey"
    :class="moduleClass"
  >
    <slot name="actions" />
    <slot name="title" />
    <div v-if="moduleKey !== 'slogan'" class="teal-card-content relative min-w-0 rounded-xl bg-white">
      <slot />
    </div>
    <slot v-else />
  </div>
</template>

<style scoped>
/* 内侧描边不占用尺寸，卡片留白由测量与渲染共用的条目组件提供。 */
.teal-card-content {
  box-shadow: inset 0 0 0 1px color-mix(in srgb, currentColor 8%, transparent);
}
</style>
