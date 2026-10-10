<template>
  <Item
    v-for="item in showList"
    :key="item.id"
    :item="item"
    :item-height="itemHeight"
    @ready="handleReady"
    @pause="pauseTrack"
    @resume="resumeTrack"
  />
</template>

<script setup>
import { getUUID } from "@/utils";
import { useElementSize } from "@vueuse/core";
import { onMounted, onUnmounted, ref, watch } from "vue";
import Item from "./item.vue";

defineOptions({ name: "SfBarrage" });

const props = defineProps({
  // 待播放的弹幕内容。
  list: { type: Array, default: () => [] },
  // 每条弹幕的高度。
  itemHeight: { type: Number, default: 40 },
  // 轨道之间的垂直间距。
  spacing: { type: Number, default: 48 },
  // 容器顶部预留的距离。
  topMargin: { type: Number, default: 80 },
  // 弹幕所处容器的选择器。
  containerSelector: { type: String, default: ".data-barrage-container" },
  // 是否持续循环播放列表。
  loop: { type: Boolean, default: true },
  // 所有弹幕统一使用的速度，单位为像素每秒。
  speed: { type: Number, default: 90 },
  // 同一轨道前后两条弹幕的最小距离。
  gap: { type: Number, default: 120 },
});

const containerElement = ref(null);
const { width: containerWidth, height: containerHeight } = useElementSize(containerElement);
const showList = ref([]);
let tracks = [];
let nextIndex = 0;
let frameId = 0;
let previousTime = 0;
let elapsed = 0;

// 尺寸或内容变化时重新布置轨道，避免弹幕越界或重叠。
const reset = () => {
  showList.value = [];
  nextIndex = 0;
  elapsed = 0;
  const count = Math.max(0, Math.floor(
    (containerHeight.value - props.topMargin + props.spacing) /
      Math.max(1, props.itemHeight + props.spacing),
  ));
  tracks = Array.from({ length: count }, (_, index) => ({
    // 轨道内当前显示的弹幕。
    items: [],
    // 悬停期间暂停整条轨道，保持原有间距。
    paused: false,
    // 各轨道错开首条弹幕的出现时间。
    availableAt: index * 180,
  }));
};

const handleReady = (id, width) => {
  const item = showList.value.find((entry) => entry.id === id);
  if (!item) return;
  item.width = width;
  item.x = -width;
  item.ready = true;
};
const pauseTrack = (item) => {
  if (tracks[item.track]) tracks[item.track].paused = true;
};
const resumeTrack = (item) => {
  if (tracks[item.track]) tracks[item.track].paused = false;
};

// 逐轨道检查入口空间，前一条让出足够距离后立即补充下一条。
const fillTrack = (track, index) => {
  if (!props.list.length || (!props.loop && nextIndex >= props.list.length)) return;
  const last = track.items.at(-1);
  if (track.paused || elapsed < track.availableAt ||
      (last && (!last.ready || last.x < Math.max(0, props.gap)))) return;
  const item = {
    ...props.list[nextIndex % props.list.length],
    // 每次播放使用独立标识。
    id: getUUID(),
    // 当前所属的轨道索引。
    track: index,
    // 相对容器左侧的水平坐标。
    x: 0,
    // 挂载后测量得到的实际宽度。
    width: 0,
    // 宽度测量完成后才开始显示和移动。
    ready: false,
    // 相对容器顶部的垂直坐标。
    top: props.topMargin + index * (props.itemHeight + props.spacing),
  };
  nextIndex += 1;
  showList.value.push(item);
  // 使用同一个响应式对象，保证轨道调度与画面位置同步。
  track.items.push(showList.value.at(-1));
};

const animate = (time) => {
  // 页面切回前台时丢弃过长的时间差，避免弹幕突然飞过屏幕。
  const delta = previousTime ? Math.min(time - previousTime, 50) : 0;
  previousTime = time;
  if (!document.hidden && containerWidth.value > 0) {
    elapsed += delta;
    const distance = Math.max(1, props.speed) * delta / 1000;
    tracks.forEach((track, index) => {
      if (!track.paused) {
        track.items.forEach((item) => {
          if (item.ready) item.x += distance;
        });
      }
      track.items = track.items.filter((item) => !item.ready || item.x < containerWidth.value);
      fillTrack(track, index);
    });
    showList.value = showList.value.filter((item) => !item.ready || item.x < containerWidth.value);
  }
  frameId = requestAnimationFrame(animate);
};

watch(
  [containerWidth, containerHeight, () => props.list, () => props.itemHeight,
    () => props.spacing, () => props.topMargin],
  reset,
  { deep: true },
);
onMounted(() => {
  containerElement.value = document.querySelector(props.containerSelector);
  if (!containerElement.value) return;
  reset();
  frameId = requestAnimationFrame(animate);
});
// 关闭组件后停止调度，重新打开不会叠加旧动画。
onUnmounted(() => cancelAnimationFrame(frameId));
</script>
