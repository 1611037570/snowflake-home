<template>
  <div
    class="flex-c relative cursor-pointer overflow-hidden transition-all duration-300"
    :class="[iconClass]"
    :style="boxIconStyle"
  >
    <Icon ref="iconify" :icon="icon" class="bg-transparent" :style="iconStyle" />
  </div>
  <!-- class="iconify-icon"
         :rotate="rotate"
      :flip="flip"
   -->
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

const props = withDefaults(defineProps<IconProps>(), {
  icon: "fa6-solid:snowflake",
  size: 16,
  rotate: 180,
  flip: "vertical",
  auto: true,
});
const boxIconStyle = computed(() => {
  const size = Number(props.boxSize || props.size) * 4;
  return {
    width: `${size}px`,
    height: `${size}px`,
  };
});
const iconStyle = computed(() => {
  const size = Number(props.size) * 4;
  return {
    width: `${size}px`,
    height: `${size}px`,
  };
});
const emit = defineEmits(["success", "fail"]);
const iconClass = ref("");
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
</script>
<style scoped></style>
