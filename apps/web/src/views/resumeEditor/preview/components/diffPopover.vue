<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { useDiffPopoverStore } from "@/stores/modules/diffPopover";
import DiffContent from "./diffField/diffContent.vue";

const store = useDiffPopoverStore();
const popoverRef = ref(null);
const popoverSize = ref({ width: 0, height: 0 });
// 鼠标进入浮层后锁定位置，避免浮层持续跟随导致无法点击按钮与滚动内容
const popoverLocked = ref(false);

// 浮层跟随鼠标移动：rAF 节流避免高频位置更新
// 鼠标进入浮层实际矩形即永久锁定，不再跟随；接近扩展区域先停止跟随，避免追不上
// Teleport 内模板 ref 偶发绑定为空，统一用 class 选择器直接取 DOM
let rafId = 0;
const getPopoverEl = () =>
  popoverRef.value || document.querySelector(".diff-popover");
const updatePosition = (e) => {
  if (popoverLocked.value) return;
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    const el = getPopoverEl();
    if (el) {
      const rect = el.getBoundingClientRect();
      // 进入浮层实际区域：立即锁定，后续任何鼠标移动都不再更新位置
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        popoverLocked.value = true;
        return;
      }
      // 接近扩展区域：停止跟随，让鼠标可以平稳进入浮层触发锁定
      const pad = 30;
      if (
        e.clientX >= rect.left - pad &&
        e.clientX <= rect.right + pad &&
        e.clientY >= rect.top - pad &&
        e.clientY <= rect.bottom + pad
      ) {
        return;
      }
    }
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
      // Teleport 内模板 ref 偶发绑定为空，nextTick 后按 class 兜底绑定，保证锁定与接近检测可用
      nextTick(() => {
        if (!popoverRef.value) {
          popoverRef.value = document.querySelector(".diff-popover");
        }
      });
    } else {
      document.removeEventListener("mousemove", updatePosition);
      // 隐藏时重置锁定状态，下次弹出可重新跟随
      popoverLocked.value = false;
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
      const el = getPopoverEl();
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
  <Teleport to="body" v-if="store.visible">
    <div
      ref="popoverRef"
      class="diff-popover fixed z-50 flex max-h-[540px] w-max max-w-[700px] min-w-[180px] flex-col rounded-3xl border-2 border-sf-theme-2 bg-sf-primary p-2"
      :style="popoverStyle"
      @mouseenter="popoverLocked = true; store.stay()"
      @mouseleave="popoverLocked = false; store.hide()"
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
