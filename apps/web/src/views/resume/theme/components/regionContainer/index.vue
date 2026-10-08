<script setup>
import { computed } from "vue";
import { resolveRegionSlot } from "@/views/resume/theme/regionSlots";
import { resolveRegionAppearance } from "./registry";
import { resolveRegionPadding } from "@/views/resume/theme/regionPadding";
import { layoutStretchesColumns } from "@/views/resume/theme/layouts";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = defineProps({
  // 引擎下发的区域编号：slogan 承载标语，user 承载个人信息，main 承载正文
  regionId: {
    type: String,
    required: true,
  },
  // 引擎结算后的区域留白：含页面上边距等布局注入量，缺省时读主题声明
  regionPadding: {
    type: Object,
    default: undefined,
  },
});
const { ui } = useResumePreviewContext();
const slot = computed(() => resolveRegionSlot(props.regionId));
// 区域外观只按主题编号选择，具体样式由对应组件维护。
const appearance = computed(() => resolveRegionAppearance(ui.value?.theme?.template, slot.value));
// 区域外观与剩余空间共用同一个根容器：分页与渲染读同一份留白，布局注入量不会被漏掉
const padding = computed(() => props.regionPadding ?? resolveRegionPadding(ui.value, slot.value));
const regionStyle = computed(() => {
  const regionPadding = padding.value;
  // 正文处于双栏布局时，底部追加栏内为页脚预留的空间
  const bottomSpace =
    slot.value === "main" && layoutStretchesColumns(ui.value?.layout?.type)
      ? "var(--resume-bottom-space, 0px)"
      : "0px";
  return {
    paddingTop: `${regionPadding.top}px`, // 区域顶部留白
    // 左右留白为 0 表示该方向不接管：通栏页眉由组件自行补出页面左右边距
    ...(regionPadding.right ? { paddingRight: `${regionPadding.right}px` } : {}),
    paddingBottom: `calc(${regionPadding.bottom}px + ${bottomSpace})`, // 区域底部留白与栏内页尾空间
    ...(regionPadding.left ? { paddingLeft: `${regionPadding.left}px` } : {}),
  };
});
</script>

<template>
  <!-- 区域留白由容器按声明施加在外观组件根元素上，主题不再重复书写同值样式。 -->
  <component
    :is="appearance"
    :class="{ 'resume-view-container relative box-border flex w-full min-h-0 min-w-0 flex-1': slot === 'main' }"
    :style="regionStyle"
  >
    <slot />
  </component>
</template>

<style lang="scss" scoped></style>
