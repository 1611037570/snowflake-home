<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { useDiffPopoverStore } from "@/stores/modules/diffPopover";
import DiffContent from "./diffField/diffContent.vue";

const store = useDiffPopoverStore();
const popoverRef = ref(null);
const popoverSize = ref({ width: 0, height: 0 });

// 浮层跟随鼠标移动：rAF 节流避免高频位置更新；鼠标进入浮层本体后停止跟手
let rafId = 0;
const updatePosition = (e) => {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    const el = popoverRef.value;
    if (el && el.contains(e.target)) return;
    store.x = e.clientX;
    store.y = e.clientY;
  });
};
// 悬浮层可见期间注册全局 mousemove，隐藏后移除
watch(
  () => store.visible,
  (visible) => {
    if (visible) {
      document.addEventListener("mousemove", updatePosition);
    } else {
      document.removeEventListener("mousemove", updatePosition);
    }
  },
  { immediate: true },
);

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

// 定位：贴合鼠标右下方展开，越界时反向并收敛到窗口内，保证不超出屏幕
const popoverStyle = computed(() => {
  const { width, height: popHeight } = popoverSize.value;
  const margin = 12;
  const offset = 14;
  let x = store.x + offset;
  let y = store.y + offset;
  if (width && x + width > window.innerWidth - margin) x = store.x - width - offset;
  if (popHeight && y + popHeight > window.innerHeight - margin) y = store.y - popHeight - offset;
  x = Math.max(margin, Math.min(x, window.innerWidth - width - margin));
  y = Math.max(margin, Math.min(y, window.innerHeight - popHeight - margin));
  return { left: `${x}px`, top: `${y}px` };
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="store.visible"
      ref="popoverRef"
      class="fixed z-50 flex max-h-[540px] w-max max-w-[700px] min-w-[180px] flex-col rounded-3xl border-2 border-sf-theme-2 bg-sf-primary p-2"
      :style="popoverStyle"
      @mouseenter="store.stay"
      @mouseleave="store.hide"
    >
      <div class="min-h-0 flex-1 overflow-y-auto rounded-xl">
        <div class="rounded-xl bg-[#e8f5e9] px-1 text-[#2e7d32]">
          <DiffContent :content="store.newValue" :html="store.html" :show-count="true" />
        </div>
        <div
          v-if="store.value"
          class="mt-1 rounded-xl bg-[#fef0f0] px-1 text-[#d32f2f] line-through"
        >
          <DiffContent :content="store.value" :html="store.html" :show-count="true" />
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
