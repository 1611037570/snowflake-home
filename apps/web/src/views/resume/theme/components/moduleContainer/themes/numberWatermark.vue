<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = defineProps({
  // 模块 key：用于取正文序号并写入 data-module
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

const {
  bodyModuleKeys,
  theme: { themeColor },
} = useResumePreviewContext();
// 序号沿用可见正文模块顺序：个人信息与标语不参与编号，因此不绘制水印
const moduleNumber = computed(() => {
  const index = bodyModuleKeys.value.indexOf(props.moduleKey);
  return index < 0 ? "" : String(index + 1).padStart(2, "0");
});
</script>

<template>
  <!-- 水印序号：淡色大序号贴在模块右上角，绝对定位不参与模块尺寸 -->
  <div
    class="resume-module-wrapper group group/module relative box-border flex min-w-0 flex-col"
    :data-module="moduleKey"
    :class="moduleClass"
  >
    <span
      v-if="moduleNumber"
      aria-hidden="true"
      class="watermark-number"
      :style="{ color: themeColor }"
      >{{ moduleNumber }}</span
    >
    <slot name="actions" />
    <!-- 标题槽与正文槽保持原有排列顺序。 -->
    <slot name="title" />
    <slot />
  </div>
</template>

<style scoped>
/* 水印只做节奏提示，压到一成不透明度，避免与标题抢注意力 */
.watermark-number {
  position: absolute;
  top: -6px;
  right: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 3em;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  opacity: 0.1;
  pointer-events: none;
}
</style>
