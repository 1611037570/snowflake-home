<template>
  <div
    class="flex-c relative cursor-pointer overflow-hidden transition-all duration-300"
    :class="[iconClass]"
    :style="[boxIconStyle]"
  >
    <component
      v-if="localIcon"
      :is="localIcon"
      class="bg-transparent"
      :style="[baseStyle(size)]"
    />
    <Icon v-else ref="iconify" :icon="icon" class="bg-transparent" :style="[baseStyle(size)]" />
    <!-- class="iconify-icon"
           :rotate="rotate"
        :flip="flip"
     -->
  </div>
</template>

<script setup lang="ts">
import { ICON_LIST } from "@/configs";
import { Icon, loadIcon } from "@iconify/vue";
import { inject, toRaw } from "vue";
import { SF_ICON_LIST_KEY, SF_ICON_LOCAL_KEY } from "./context";

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
  return baseStyle(props.boxSize || props.size);
});

const emit = defineEmits(["success", "fail"]);
const iconClass = ref("");
// 编辑器通过父级注入本地图标，未注入时保留远程图标兜底
const localIconList = inject(SF_ICON_LIST_KEY, null);
const localIconEnabled = inject(SF_ICON_LOCAL_KEY, true);
const localIcon = computed(() => {
  if (!localIconEnabled || !localIconList) return null;
  const component = localIconList[props.icon];
  return component ? toRaw(component) : null;
});
const baseStyle = (s: any) => {
  s = Number(s) * 4;
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
  iconClass.value = item?.color || "";
  if (localIcon.value) {
    emit("success");
    return;
  }
  if (!item) {
    emit("fail");
    return;
  }

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
