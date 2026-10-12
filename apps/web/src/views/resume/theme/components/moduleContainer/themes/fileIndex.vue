<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = defineProps({
  moduleKey: {
    type: String, // 当前模块编号，用于取正文序号并写入 data-module
    default: "",
  },
  moduleClass: {
    type: String, // 编辑器按模块状态下发的附加类名
    default: "",
  },
});

const {
  bodyModuleKeys,
  theme: { themeColor },
} = useResumePreviewContext();
// 序号沿用可见正文模块的顺序：个人信息与标语不参与编号，因此不绘制序号。
const moduleNumber = computed(() => {
  const index = bodyModuleKeys.value.indexOf(props.moduleKey);
  return index < 0 ? "" : String(index + 1).padStart(2, "0");
});
const numberStyle = computed(() => ({
  color: themeColor.value, // 大序号使用主题色，与标题形成同一视觉轴
}));
</script>

<template>
  <!-- 大序号绘制在区域左侧索引栏内，绝对定位不占用模块尺寸。 -->
  <div
    class="resume-module-wrapper group group/module relative box-border flex min-w-0 flex-col"
    :data-module="moduleKey"
    :class="moduleClass"
  >
    <span v-if="moduleNumber" class="file-index__number" :style="numberStyle" aria-hidden="true">{{
      moduleNumber
    }}</span>
    <slot name="actions" />
    <!-- 标题槽与正文槽保持原有排列顺序。 -->
    <slot name="title" />
    <slot />
  </div>
</template>

<style scoped>
.file-index__number {
  position: absolute;
  /* 大序号与标题首行对齐，右缘留出引导线的位置。 */
  top: -3px;
  right: calc(100% + 12px);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 30px;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.65em;
  font-weight: 700;
  line-height: 1;
  pointer-events: none;
}
</style>
