<script setup>
// 逐个揭示网格：响应式列数(由 Tailwind 断点决定) + 逐项淡入入场
// 调用方仅通过 #default 插槽决定每项渲染内容（含新建入口等常驻项也走此插槽参与动画），#empty 提供空状态
import { computed, onMounted, onUnmounted, ref, useSlots } from "vue";

defineOptions({ name: "RevealGrid" });

const props = defineProps({
  // 待揭示的列表，项需含 keyField 指定的唯一字段
  items: { type: Array, required: true },
  // 每项揭示间隔(ms)
  interval: { type: Number, default: 120 },
  // 列表项唯一键字段名，用于 TransitionGroup 稳定 key
  keyField: { type: String, default: "id" },
  size: { type: String, default: "default" },
});

const slots = useSlots();
const rootRef = ref(null);

// 已揭示数量：从 0 递增到 items.length，驱动逐项淡入
const visibleCount = ref(0);
const visibleItems = computed(() => props.items.slice(0, visibleCount.value));

let timer = null;

onMounted(() => {
  timer = setInterval(() => {
    visibleCount.value += 1;
    if (visibleCount.value >= props.items.length) {
      clearInterval(timer);
      timer = null;
    }
  }, props.interval);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// 稳定 key：优先取 keyField 字段，缺省回退下标
const getKey = (item, index) => item?.[props.keyField] ?? index;

const gridClass = computed(() => {
  if (props.size === "default") {
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
  } else if (props.size === "small") {
    return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
  }
  return "";
});
</script>

<template>
  <!--   -->
  <div ref="rootRef" :class="gridClass" class="grid gap-3">
    <TransitionGroup name="sf-reveal">
      <!-- 包裹项 flex justify-center 让卡片在列宽内居中（列宽 > 卡片宽时不再靠左） -->
      <div
        v-for="(item, index) in visibleItems"
        :key="getKey(item, index)"
        class="flex items-center justify-center"
      >
        <slot name="default" :item="item" :index="index" />
      </div>
      <!-- 空状态：列表为空时占满整行 -->
      <div v-if="!items.length && slots.empty" key="__sf-empty" class="col-span-full">
        <slot name="empty" />
      </div>
    </TransitionGroup>
  </div>
</template>

<style>
/* 逐项入场 + 增删位移过渡，供 TransitionGroup 复用 */
.sf-reveal-enter-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.sf-reveal-enter-from {
  opacity: 0;
  transform: translateY(28px) scale(0.94);
}
.sf-reveal-move {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
