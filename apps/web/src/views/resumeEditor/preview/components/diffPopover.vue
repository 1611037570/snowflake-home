<script setup>
import { computed } from "vue";
import { useDiffPopoverStore } from "@/stores/modules/diffPopover";
import DiffContent from "./diffField/diffContent.vue";

const store = useDiffPopoverStore();

// 依据字段坐标与悬浮方向计算 fixed 定位
const popoverStyle = computed(() => {
  if (!store.rect) return {};
  const { top, left, right, height } = store.rect;
  const horizontal =
    store.align === "right"
      ? { right: `${window.innerWidth - right}px` }
      : { left: `${left}px` };
  if (store.direction === "up") {
    return { ...horizontal, top: `${top}px`, transform: "translateY(-100%)" };
  }
  return { ...horizontal, top: `${top + height}px` };
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="store.visible"
      class="fixed z-50 flex max-h-[240px] min-w-[180px] max-w-[420px] w-max flex-col rounded-3xl border border-sf-b bg-sf-bg p-2 shadow-lg"
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
