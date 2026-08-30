<template>
  <div
    class="flex-c relative cursor-pointer overflow-hidden transition-all duration-300"
    :class="[iconClass]"
    :style="[boxIconStyle]"
  >
    <Icon ref="iconify" :icon="icon" class="bg-transparent" :style="[baseStyle(size)]" />
    <!-- class="iconify-icon"
           :rotate="rotate"
        :flip="flip"
     -->
  </div>
</template>

<script setup lang="ts">
import { ICON_LIST } from "@/configs";
import { Icon, loadIcon } from "@iconify/vue";

defineOptions({ name: "SfIcon" });

export interface IconProps {
  /**
   * Iconify 图标名称
   */
  icon?: string;

  /**
   * 图标大小
   */
  size?: number | string;
  /**
   * 图标盒子大小
   */
  boxSize?: number | string;
  /**
   * 图标旋转角度
   */
  rotate?: number;
  /**
   * 图标翻转方向
   */
  flip?: "horizontal" | "vertical";
}
const size = computed(() => Number(props.size));
const boxSize = computed(() => Number(props.boxSize));
const props = withDefaults(defineProps<IconProps>(), {
  icon: "fa6-solid:snowflake",
  size: 16,
  rotate: 180,
  flip: "vertical",
  auto: true,
});
const boxIconStyle = computed(() => {
  return baseStyle(boxSize.value * 4);
});

const emit = defineEmits(["success", "fail"]);
const iconClass = ref("");
const baseStyle = (s: any) => {
  return {
    fontSize: `${s}px !important`,
    width: `${s}px !important`,
    height: `${s}px !important`,
    minWidth: `${s}px !important`,
    minHeight: `${s}px !important`,
    maxWidth: `${s}px !important`,
    maxHeight: `${s}px !important`,
  };
};
function init() {
  const item = ICON_LIST[props.icon];
  if (!item) {
    emit("fail");
    return;
  }

  iconClass.value = item.color || "";
  loadIcon(item.icon)
    .then(() => {
      emit("success");
    })
    .catch(() => {
      emit("fail");
    });
}
init();
// https://iconify.design/docs/icon-components/vue/
</script>
<style scoped></style>
