<script setup>
import { nextTick, ref, watch } from "vue";
import { useDiffPopoverStore } from "@/stores/modules/diffPopover";
import DiffContent from "./diffField/diffContent.vue";

const store = useDiffPopoverStore();
const popoverRef = ref(null);
// 浮层始终挂载（v-show 控制显隐），首次进入即完成渲染，避免每次展示都重建 DOM
// 定位以鼠标当前坐标为锚点，按真实弹性尺寸做按轴翻转收敛到窗口内；
// 仅在「真正展示 / 切换字段」时计算一次后锁定写入 ref：
// 同一字段内移动鼠标（含 html 多块字段块间移动）不再重定位，内容异步回流也不重算坐标
// 不用 visibility 预隐藏：flush:post + nextTick 全在微任务内，浏览器绘制前已按真实
// 尺寸落位，不会出现闪烁；同时避免 watcher 取不到 DOM 时「卡死 hidden」的失败模式
const popoverStyle = ref({
  left: "-9999px",
  top: "-9999px",
});

// Teleport 内模板 ref 偶发绑定为空，统一用 class 选择器兜底取 DOM
const getPopoverEl = () => popoverRef.value || document.querySelector(".diff-popover");

// 展示或切换字段时量尺并一次性定位：
// - visible 由假转真：首次展示
// - field 引用变化：移入不同字段（同一字段内 mouseover 不改变 field 引用，不触发）
// watch 源只含 [visible, field]：html 富文本字段被拆成多块（共享同一 data-field-key），
// 鼠标在块间移动会让鼠标坐标变化但 field 不变，若 watch 坐标会误触发重定位造成跟随
watch(
  () => [store.visible, store.field],
  async ([visible, field]) => {
    if (!visible || !field) {
      // 隐藏时复位到屏外，避免下次展示前停留在旧坐标
      popoverStyle.value = {
        left: "-9999px",
        top: "-9999px",
      };
      return;
    }
    // await 前捕获鼠标坐标：取触发本次展示的位置，块间移动不进入本分支
    const mx = store.x;
    const my = store.y;
    // 内容已由 store.show 写入，等渲染完毕后取真实弹性尺寸
    await nextTick();
    const el = getPopoverEl();
    if (!el) return;
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    const margin = 12;
    const maxX = window.innerWidth - margin;
    const maxY = window.innerHeight - margin;
    // 弹窗左上角直接对齐鼠标坐标（无偏移）；按真实弹性尺寸判断越界，
    // 空间不足时翻转到鼠标另一侧，使弹窗边角始终贴住光标
    let x = mx;
    let y = my;
    if (width && x + width > maxX) x = mx - width;
    if (height && y + height > maxY) y = my - height;
    // 翻转后仍越界（弹窗大于可用空间）时再夹回窗口内
    x = Math.max(margin, Math.min(x, maxX - width));
    y = Math.max(margin, Math.min(y, maxY - height));
    popoverStyle.value = {
      left: `${x}px`,
      top: `${y}px`,
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
