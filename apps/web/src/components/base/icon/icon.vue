<template>
  <div
    class="flex-c relative cursor-pointer overflow-hidden transition-all duration-300"
    :class="[iconClass]"
    :style="[boxIconStyle]"
    :data-sf-icon-state="resourceState"
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
import { SF_ICON_LIST_KEY } from "./context";
import { LOCAL_ICON_LIST } from "./localIcons";

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
// 导出按当前简历中的图标状态等待，避免复制尚未加载的占位内容。
const resourceState = ref<"loading" | "ready" | "error">("loading");
// 优先使用父级注入图标，其次使用基础组件内置图标
const localIconList = inject(SF_ICON_LIST_KEY, null);
const localIcon = computed(() => {
  const component = localIconList?.[props.icon] ?? LOCAL_ICON_LIST[props.icon];
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
    resourceState.value = "ready";
    emit("success");
    return;
  }
  if (!item) {
    resourceState.value = "error";
    emit("fail");
    return;
  }

  loadIcon(item.icon)
    .then(() => {
      resourceState.value = "ready";
      emit("success");
    })
    .catch(() => {
      resourceState.value = "error";
      emit("fail");
    });
}
init();
// https://iconify.design/docs/icon-components/vue/
</script>
<style scoped></style>
