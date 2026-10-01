<script setup>
import { computed } from "vue";
import { resolveUserAppearance } from "./registry";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = defineProps({
  // 模块 key：传给外观组件写入 data-module，供编辑器点击定位
  moduleKey: {
    type: String,
    default: "user",
  },
  // 模块附加类名，由编辑器按模块状态下发
  moduleClass: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["mouseenter"]);

const {
  theme: { userModuleTemplate: themeTemplateRef },
} = useResumePreviewContext();
// 未提供主题时沿用默认个人信息样式。
const themeTemplate = computed(() => themeTemplateRef.value || "default");
// 外观由主题编号解析，未登记的主题沿用旧版统一外观。
const appearance = computed(() => resolveUserAppearance(themeTemplate.value));
</script>

<template>
  <!-- 分发器只解析外观组件，根元素与几何由外观组件自己负责，避免多包一层改变布局 -->
  <component
    :is="appearance"
    :theme-id="themeTemplate"
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
