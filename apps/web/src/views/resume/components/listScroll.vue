<script setup>
import { useResizeObserver } from "@vueuse/core";
import { nextTick, ref, watch } from "vue";

const props = defineProps({
  /** 是否仍有下一批列表内容。 */
  hasMore: { type: Boolean, default: false },
  /** 当前是否正在加载列表内容。 */
  loading: { type: Boolean, default: false },
  /** 已展示的列表条数，用于控制结束提示。 */
  count: { type: Number, default: 0 },
  /** 加载下一批内容；返回 false 时暂停自动重试。 */
  loadMore: { type: Function, required: true },
  /** 列表切换标识，用于重置滚动位置和失败状态。 */
  resetKey: { type: [String, Number], default: "" },
  /** 列表内容容器的样式类。 */
  contentClass: { type: String, default: "" },
  /** 是否关闭滚动容器默认的左右内边距。 */
  flush: { type: Boolean, default: false },
});

const scrollbarRef = ref(null);
const contentRef = ref(null);
const loadingRef = ref(null);
const loadingMore = ref(false);
const paused = ref(false);
// 底部提示的最小停留时长：追加批次后新卡片会把提示顶到可视区之外，
// 因此提示必须先单独停留这段时间，再让调用方追加内容。
const MIN_LOADING_DURATION = 300;

// 距离底部二百像素时加载下一批，并在内容不足一屏时继续补足。
const checkBottom = async () => {
  const wrap = scrollbarRef.value?.wrapRef;
  if (!wrap || props.loading || loadingMore.value || paused.value || !props.hasMore) return;
  if (wrap.scrollHeight - wrap.scrollTop - wrap.clientHeight > 200) return;
  const key = props.resetKey;
  // 先只渲染提示并停留一小段时间，让提示被滚入可视区并停留；随后才追加下一批。
  loadingMore.value = true;
  await new Promise((resolve) => setTimeout(resolve, MIN_LOADING_DURATION));
  try {
    // 停留期间切换了列表就放弃这一批，交给新列表重新判断。
    if (key !== props.resetKey) return;
    if ((await props.loadMore()) === false && key === props.resetKey) paused.value = true;
  } catch {
    if (key === props.resetKey) paused.value = true;
  } finally {
    await nextTick();
    loadingMore.value = false;
    if (!paused.value) checkBottom();
  }
};

// 用户再次滚动时解除暂停：一次加载被判失败或判为结束，不能让列表永久失去触底能力。
const handleScroll = () => {
  paused.value = false;
  checkBottom();
};

// 筛选切换后回到首批，内容和滚动区域变化时重新判断是否需要加载。
watch(
  () => props.resetKey,
  () => {
    paused.value = false;
    scrollbarRef.value?.setScrollTop(0);
    nextTick(checkBottom);
  },
);
watch(
  () => props.loading,
  (loading) => {
    if (!loading) nextTick(checkBottom);
  },
);
// 触底加载时将提示滚入可视区底部，新增卡片后保留原滚动位置。
watch(
  () => loadingMore.value || (props.loading && props.count > 0),
  async (loading) => {
    if (!loading) return;
    // 等待当前内容与提示渲染完成：列表切换会重建内容，用渲染前的尺寸判断会误判为触底
    await nextTick();
    const wrap = scrollbarRef.value?.wrapRef;
    // 容器仍停在顶部说明是切换列表或内容不足一屏，此时不能把视图滚走
    if (!wrap || !wrap.scrollTop) return;
    if (wrap.scrollHeight - wrap.scrollTop - wrap.clientHeight > 200) return;
    const indicator = loadingRef.value;
    if (!indicator) return;
    const distance = indicator.getBoundingClientRect().bottom - wrap.getBoundingClientRect().bottom;
    if (distance > 0) scrollbarRef.value?.setScrollTop(wrap.scrollTop + distance);
  },
);
useResizeObserver(contentRef, checkBottom);
</script>

<template>
  <SfScrollbar ref="scrollbarRef" :flush="flush" @scroll="handleScroll">
    <div ref="contentRef" class="flex min-h-full shrink-0 flex-col" :class="contentClass">
      <slot />
      <!-- 各列表共用加载中与结束状态，避免不同入口出现不同提示。 -->
      <div
        v-if="loadingMore || (loading && count > 0)"
        ref="loadingRef"
        class="flex items-center justify-center gap-3 py-3 text-sm text-sf-text-2"
        role="status"
        aria-busy="true"
      >
        <span
          class="h-6 w-6 animate-spin rounded-full border-2 border-sf-theme-2 border-t-sf-theme"
          aria-hidden="true"
        />
        {{ $t("resumeTemplateLoading") }}
      </div>
      <div
        v-else-if="count > 0 && !hasMore"
        class="flex items-center justify-center gap-3 py-6 text-sm text-sf-text-3"
      >
        <span aria-hidden="true" class="bg-sf-border h-px w-12" />
        <span>{{ $t("resumeTemplateNoMore") }}</span>
        <span aria-hidden="true" class="bg-sf-border h-px w-12" />
      </div>
      <slot name="footer" />
    </div>
  </SfScrollbar>
</template>
