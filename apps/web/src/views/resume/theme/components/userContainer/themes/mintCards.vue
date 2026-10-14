<script setup>
import DefaultUser from "./default.vue";

defineProps({
  themeId: { type: String, default: "mintCards" }, // 当前主题编号
  moduleKey: { type: String, default: "user" }, // 个人信息模块编号
  moduleClass: { type: String, default: "" }, // 编辑器模块状态类名
});
</script>

<template>
  <!-- 复用通用个人信息外壳，只为薄荷页眉补足底部留白。 -->
  <DefaultUser v-bind="$props" class="pb-6">
    <template #actions><slot name="actions" /></template>
    <slot />
  </DefaultUser>
</template>
