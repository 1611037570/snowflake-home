<template v-if="init">
  <Item
    v-for="(item, key) in showList"
    :key="key"
    :item="item"
    :containerWidth="containerWidth"
    :containerRef="containerElement"
    @enter="handleEnter"
    @leave="handleLeave"
  />
</template>

<script setup>
import { getUUID } from "@/utils";
import { useElementSize } from "@vueuse/core";
import { computed, nextTick, onMounted, ref } from "vue";
import Item from "./item.vue";

defineOptions({ name: "SfBarrage" });

// Props
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  itemHeight: { type: Number, default: 40 },
  spacing: { type: Number, default: 10 },
  topMargin: { type: Number, default: 80 },
  containerSelector: { type: String, default: ".data-barrage-container" },
  loop: { type: Boolean, default: true },
});

const containerElement = ref(null);
const { width: containerWidth, height: containerHeight } = useElementSize(containerElement);
const showList = ref({});
const init = ref(false);
const tracks = ref([]); // 轨道：[{top, occupied: 弹幕ID/null}]
const waitList = ref([]);

// 最大轨道数
const maxTracks = computed(() =>
  containerElement.value
    ? Math.max(
        1,
        Math.floor((containerHeight.value - props.topMargin) / (props.itemHeight + props.spacing)),
      )
    : 1,
);

// 弹幕进入：释放对应轨道 + 补等待列表
const handleEnter = (item) => {
  const trackIdx = tracks.value.findIndex((t) => t.occupied === item.id);
  if (trackIdx > -1) {
    tracks.value[trackIdx].occupied = null;
    waitList.value.length && addBarrage(waitList.value.shift(), true);
  }
};

// 弹幕离开：清理 + 循环重加
const handleLeave = (item) => {
  delete showList.value[item.id];
  props.loop && setTimeout(() => addBarrage(item), Math.random() * 1000);
};

// 添加弹幕（核心精简）
const addBarrage = (item, isFromWait = false) => {
  const id = getUUID();
  setTimeout(() => {
    // 初始化轨道
    if (tracks.value.length !== maxTracks.value) {
      tracks.value = Array.from({ length: maxTracks.value }, (_, i) => ({
        top: `${props.topMargin + i * (props.itemHeight + props.spacing)}px`,
        occupied: null,
      }));
    }
    // 选可用轨道
    const availableIds = tracks.value.map((t, i) => (t.occupied ? -1 : i)).filter((i) => i > -1);
    if (availableIds.length) {
      const idx = availableIds[Math.floor(Math.random() * availableIds.length)];
      tracks.value[idx].occupied = id;
      showList.value[id] = {
        ...item,
        id,
        style: {
          top: tracks.value[idx].top,
          transform: "translateX(-100%)",
          transition: "transform 8000ms linear",
        },
      };
    } else if (!isFromWait) waitList.value.push(item);
  }, Math.random() * 1000);
};

// 初始化
const initBarrage = () => {
  showList.value = {};
  waitList.value = [];
  tracks.value.forEach((t) => (t.occupied = null));
  props.list.forEach((item) => addBarrage(item));
};

// 挂载
onMounted(async () => {
  containerElement.value = document.querySelector(props.containerSelector);
  if (!containerElement.value) return console.error("未找到弹幕容器");
  await nextTick();
  init.value = true;
  initBarrage();
});
</script>

<style scoped></style>
