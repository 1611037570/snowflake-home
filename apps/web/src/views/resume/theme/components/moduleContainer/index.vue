<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolveModuleAppearance } from "./registry";

const props = defineProps({
  // 模块 key：写入 data-module，供编辑器点击定位
  moduleKey: {
    type: String,
    default: "",
  },
  // 模块附加类名，由编辑器按模块状态下发
  moduleClass: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["mouseenter"]);

const {
  theme: { themeTemplate },
} = useResumePreviewContext();
// 外框外观按主题编号解析，未登记的主题走 default 组件
const appearance = computed(() => resolveModuleAppearance(themeTemplate.value));
</script>

<template>
  <!-- 分发器只解析外观组件，根元素与装饰由外观组件自己负责 -->
  <component
    :is="appearance"
    :module-key="moduleKey"
    :module-class="moduleClass"
    @mouseenter="emit('mouseenter', moduleKey)"
  >
    <template #actions>
      <slot name="actions" />
    </template>
    <slot />
  </component>
</template>

<style lang="scss" scoped></style>
