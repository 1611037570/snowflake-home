<script setup lang="ts">
import { computed, provide } from "vue";
import Module from "@/views/resume/theme/components/moduleContainer/index.vue";
import UserModule from "@/views/resume/theme/components/userContainer/index.vue";
import { resumeModuleKey } from "../../shared/moduleContext";

const props = defineProps<{
  moduleKey: string; // 当前模块编号
  moduleClass?: string; // 编辑状态附加样式
}>();
// 两棵树共用外框入口，模块外观只绘图，不额外占用节点预算。
const frame = computed(() => props.moduleKey === "user" ? UserModule : Module);
provide(resumeModuleKey, computed(() => props.moduleKey)); // 下层主题读取模块身份，不依赖父级选择器
</script>

<template>
  <component :is="frame" :module-key="moduleKey" :module-class="moduleClass" :data-layout-module="moduleKey">
    <template #actions><slot name="actions" /></template>
    <template #title><slot name="title" /></template>
    <slot />
  </component>
</template>
