<template>
  <div
    ref="barrageRef"
    class="flex-c absolute left-0 z-4 w-max cursor-pointer rounded-xl bg-sf-bg px-3 py-1.5 text-base text-black whitespace-nowrap"
    :style="{
      /* 轨道位置由父组件统一计算。 */
      top: `${item.top}px`,
      /* 高度保持与轨道计算一致。 */
      height: `${itemHeight}px`,
      /* 使用容器坐标移动，悬停恢复不会跳动。 */
      transform: `translate3d(${item.x}px, 0, 0)`,
      /* 保留原有随机背景。 */
      background: background,
      /* 测量前隐藏，防止首帧闪现。 */
      visibility: item.ready ? 'visible' : 'hidden',
    }"
    @mouseenter="emit('pause', item)"
    @mouseleave="emit('resume', item)"
    @click="handleCopy(item.text)"
  >
    {{ item.text }}
  </div>
</template>

<script setup>
import { getRandomColor } from "@/utils/modules/getRandomColor";
import { useClipboard } from "@vueuse/core";
import { onMounted, ref } from "vue";

const props = defineProps({
  // 父组件调度的弹幕及其位置。
  item: { type: Object, required: true },
  // 与轨道一致的弹幕高度。
  itemHeight: { type: Number, default: 40 },
});
const emit = defineEmits(["ready", "pause", "resume"]);
const barrageRef = ref(null);
const background = getRandomColor();
const { copy } = useClipboard();

function handleCopy(text) {
  copy(text)
    .then(() => ElMessage.success("复制成功"))
    .catch(() => ElMessage.error("复制失败"));
}

// 按实际文字宽度安排入口间距，长弹幕也能持续补充。
onMounted(() => {
  emit("ready", props.item.id, barrageRef.value.getBoundingClientRect().width);
});
</script>
