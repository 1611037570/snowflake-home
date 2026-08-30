<template>
  <div
    class="flex-c relative cursor-pointer overflow-hidden transition-all duration-300"
    :class="[iconClass]"
    :style="[boxIconStyle]"
  >
    <Icon ref="iconify" :icon="icon" class="bg-transparent" :style="[baseStyle(iconSize)]" />
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

const props = withDefaults(defineProps<IconProps>(), {
  icon: "fa6-solid:snowflake",
  size: 16,
  rotate: 180,
  flip: "vertical",
  auto: true,
});
const boxIconStyle = computed(() => {
  const size = Number(props.boxSize || props.size) * 4;
  return baseStyle(size);
});
// 图标尺寸：通过 width/height 属性传递，避免 style 中 1em 相对单位导致跨浏览器大小不一致
const iconSize = computed(() => Number(props.size) * 4);
const emit = defineEmits(["success", "fail"]);
const iconClass = ref("");
const baseStyle = (size: any) => {
  return {
    fontSize: `${size}px !important`,
    width: `${size}px !important`,
    height: `${size}px !important`,
    minWidth: `${size}px !important`,
    minHeight: `${size}px !important`,
    maxWidth: `${size}px !important`,
    maxHeight: `${size}px !important`,
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
<style scoped>
.material-symbols-light--10k-outline {
  display: inline-block;
  width: 1em;
  height: 1em;
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M6.77 14.692h.884V9.308h-2.27v.884H6.77zm3.115 0h2.346q.328 0 .549-.22q.22-.22.22-.549v-3.846q0-.329-.22-.549t-.55-.22H9.886q-.33 0-.55.22t-.22.549v3.846q0 .329.22.549t.55.22m.115-.884v-3.616h2.116v3.616zm4.444.884h.885v-2.365l2.288 2.365h1.23l-2.653-2.73l2.652-2.654h-1.19l-2.327 2.327V9.308h-.885zM5.616 20q-.691 0-1.153-.462T4 18.384V5.616q0-.691.463-1.153T5.616 4h12.769q.69 0 1.153.463T20 5.616v12.769q0 .69-.462 1.153T18.384 20zm0-1h12.769q.23 0 .423-.192t.192-.424V5.616q0-.231-.192-.424T18.384 5H5.616q-.231 0-.424.192T5 5.616v12.769q0 .23.192.423t.423.192M5 5v14z'/%3E%3C/svg%3E");
  background-color: currentColor;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
</style>
