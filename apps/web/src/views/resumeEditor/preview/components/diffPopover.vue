<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { useDiffPopoverStore } from "@/stores/modules/diffPopover";
import DiffContent from "./diffField/diffContent.vue";

const store = useDiffPopoverStore();
const popoverRef = ref(null);
const popoverSize = ref({ width: 0, height: 0 });

// 弹出后读取实际尺寸，供按窗口边界约束位置使用
watch(
  () => [store.visible, store.newValue, store.value],
  async () => {
    if (store.visible) {
      await nextTick();
      const el = popoverRef.value;
      if (el) {
        popoverSize.value = { width: el.offsetWidth, height: el.offsetHeight };
      }
    }
  },
);

// 依据字段坐标、悬浮方向与窗口大小计算 fixed 定位，保证弹出层不溢出窗口
const popoverStyle = computed(() => {
  if (!store.rect) return {};
  const { top, left, right, height } = store.rect;
  const { width, height: popHeight } = popoverSize.value;
  const margin = 12;
  // 水平：靠近窗口右缘或向右展开会溢出时，改为从字段右缘向左展开
  let x = left;
  if (store.align === "right" || (width && left + width > window.innerWidth - margin)) {
    x = right - width;
  }
  // 收敛到窗口内
  x = Math.max(margin, Math.min(x, window.innerWidth - width - margin));
  // 垂直：按方向展开，空间不足时反向，最终收敛到窗口内
  let y;
  if (store.direction === "up") {
    y = top - popHeight;
    if (y < margin && top + height + popHeight <= window.innerHeight - margin) {
      y = top + height;
    }
  } else {
    y = top + height;
    if (y + popHeight > window.innerHeight - margin && top - popHeight >= margin) {
      y = top - popHeight;
    }
  }
  y = Math.max(margin, Math.min(y, window.innerHeight - popHeight - margin));
  return { left: `${x}px`, top: `${y}px` };
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="store.visible"
      ref="popoverRef"
      class="fixed z-50 flex max-h-[540px] w-max max-w-[600px] min-w-[180px] flex-col rounded-3xl border border-sf-b bg-sf-bg p-2 shadow-lg"
      :style="popoverStyle"
      @mouseenter="store.stay"
      @mouseleave="store.hide"
    >
      <div class="min-h-0 flex-1 overflow-y-auto rounded-xl">
        <div class="rounded-xl bg-[#e8f5e9] px-1 text-[#2e7d32]">
          <DiffContent :content="store.newValue" :html="store.html" />
        </div>
        <div
          v-if="store.value"
          class="mt-1 rounded-xl bg-[#fef0f0] px-1 text-[#d32f2f] line-through"
        >
          <DiffContent :content="store.value" :html="store.html" />
        </div>
      </div>
      <div class="mt-1 flex shrink-0 items-center gap-x-2">
        <div
          class="flex-c h-7 w-[45px] cursor-pointer rounded-xl border-none bg-[#2e7d32] px-1.5 text-[11px] text-white"
          @click.stop="store.keep"
        >
          保留
        </div>
        <div
          class="flex-c h-7 w-[45px] cursor-pointer rounded-xl border-none bg-[#999] px-1.5 text-[11px] text-white"
          @click.stop="store.cancel"
        >
          放弃
        </div>
      </div>
    </div>
  </Teleport>
</template>
