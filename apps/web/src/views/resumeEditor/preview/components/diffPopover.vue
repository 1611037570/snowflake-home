<script setup>
import { nextTick, ref, watch } from "vue";
import { useDiffPopoverStore } from "@/stores/modules/diffPopover";
import DiffContent from "./diffField/diffContent.vue";

const store = useDiffPopoverStore();
const popoverRef = ref(null);
// 浮层与光标的间距：浮层不压在光标下，否则指针一动就被判定移出字段而立即隐藏
const GAP = 12;
// 定位结果只在展示时写入一次并锁定，之后移动鼠标与内容回流都不再重算
const popoverStyle = ref({
  left: "-9999px",
  top: "-9999px",
});

// 修正后仍超出窗口（浮层比可用空间还大）时贴回边缘
const clampAxis = (value, size, viewport) =>
  Math.max(GAP, Math.min(value, Math.max(GAP, viewport - size - GAP)));

// 已锁定位置的草稿签名：字段代理在父级重渲染时可能被换成内容相同的新对象，
// 仅凭 field 引用变化会误判成切换字段而按最新鼠标坐标重新定位
let lockedKey = null;
const draftKey = () => `${store.html}|${store.value}|${store.newValue}`;

// visible 由假转真、或移入另一份草稿时定位一次：同一字段内鼠标移动与滚动都不触发
watch(
  () => [store.visible, store.field],
  async ([visible, field]) => {
    if (!visible || !field) {
      lockedKey = null;
      // 隐藏时复位到屏外，避免下次展示前停留在旧坐标
      popoverStyle.value = {
        left: "-9999px",
        top: "-9999px",
      };
      return;
    }
    const key = draftKey();
    if (key === lockedKey) return;
    const { x, y } = store;
    // 先把左上角贴到鼠标处再量尺：停在屏外量尺会按放大后的可用宽度算 w-max，量出的尺寸偏大致定位失真
    popoverStyle.value = {
      left: `${x + GAP}px`,
      top: `${y + GAP}px`,
    };
    await nextTick();
    const el = popoverRef.value;
    if (!el || !store.visible) return;
    const { width, height } = el.getBoundingClientRect();
    // 右下放不下时翻到光标另一侧展开，弹窗边角始终贴着鼠标
    let left = x + GAP;
    let top = y + GAP;
    if (left + width > window.innerWidth - GAP) left = x - GAP - width;
    if (top + height > window.innerHeight - GAP) top = y - GAP - height;
    // 坐标按本次锚点锁定，量尺期间鼠标已移动也不追
    lockedKey = key;
    popoverStyle.value = {
      left: `${clampAxis(left, width, window.innerWidth)}px`,
      top: `${clampAxis(top, height, window.innerHeight)}px`,
    };
  },
  { flush: "post" },
);
</script>

<template>
  <Teleport to="body">
    <div
      ref="popoverRef"
      v-show="store.visible"
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
