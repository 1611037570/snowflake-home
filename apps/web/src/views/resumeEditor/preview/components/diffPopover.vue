<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { useDiffPopoverStore } from "@/stores/modules/diffPopover";
import DiffContent from "./diffField/diffContent.vue";

const store = useDiffPopoverStore();
const popoverRef = ref(null);
// 浮层实际尺寸，用于把落位收敛到窗口内；隐藏时归零，避免沿用上一个字段的旧尺寸
const popoverSize = ref({ width: 0, height: 0 });

// Teleport 内模板 ref 偶发绑定为空，统一用 class 选择器兜底取 DOM
const getPopoverEl = () => popoverRef.value || document.querySelector(".diff-popover");

// 展示或内容变化后量尺：量尺与二次定位都在微任务内完成，浏览器绘制前已按真实尺寸落位
watch(
  () => [store.visible, store.newValue, store.value],
  async () => {
    if (!store.visible) {
      popoverSize.value = { width: 0, height: 0 };
      return;
    }
    await nextTick();
    const el = getPopoverEl();
    if (el) {
      popoverSize.value = { width: el.offsetWidth, height: el.offsetHeight };
    }
  },
  { flush: "post", immediate: true },
);

// 定位：以进入字段时的鼠标坐标为唯一锚点，浮层位置此后不再变化
// 默认贴合鼠标右下方，仅在超出窗口时做最小幅度回收，不做整体翻转以避免远离鼠标
const popoverStyle = computed(() => {
  const { width, height } = popoverSize.value;
  const margin = 12;
  const offset = 14;
  const x = Math.max(margin, Math.min(store.x + offset, window.innerWidth - margin - width));
  const y = Math.max(margin, Math.min(store.y + offset, window.innerHeight - margin - height));
  return { left: `${x}px`, top: `${y}px` };
});
</script>

<template>
  <Teleport to="body" v-if="store.visible">
    <div
      ref="popoverRef"
      class="diff-popover fixed z-50 flex max-h-[540px] w-max max-w-[700px] min-w-[180px] flex-col rounded-3xl border-2 border-sf-theme-2 bg-sf-primary p-2"
      :style="popoverStyle"
      @mouseenter="store.stay()"
      @mouseleave="store.hide()"
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
