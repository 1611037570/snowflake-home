import { useDebounceFn, useResizeObserver, unrefElement } from "@vueuse/core";
import type { MaybeComputedElementRef } from "@vueuse/core";
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import echarts from "./echarts";
import data from "./walden.json";

// 主题全局注册一次，避免重复注册
echarts.registerTheme("walden", data);

export default function useEcharts(
  el: MaybeComputedElementRef<HTMLElement | null | undefined>,
  options: any,
  config: { resize?: boolean } = {},
) {
  const { resize = true } = config;
  const chart = ref();
  const init = ref(false);
  // 容器尺寸监听停止函数
  let stopResize: (() => void) | any;
  async function initChart() {
    await nextTick();
    const dom = unrefElement(el);
    if (!dom) {
      console.warn("ECharts容器DOM不存在");
      return;
    }
    chart.value = echarts.init(dom, "walden");
    init.value = true;
  }

  // 自适应调整图表大小
  const resizeChart = useDebounceFn(() => {
    if (!chart.value) return;
    chart.value.resize();
  }, 200);

  onMounted(async () => {
    await initChart();

    // 监听容器尺寸变化，容器尺寸改变时自适应调整图表大小
    if (resize && chart.value) {
      stopResize = useResizeObserver(chart.value.getDom(), resizeChart);
    }

    watch(
      options,
      (newValue) => {
        if (!newValue) return;
        chart.value.setOption(newValue, true);
      },
      {
        deep: true,
        immediate: true,
      },
    );
  });

  onBeforeUnmount(() => {
    // 停止容器尺寸监听
    stopResize?.();
    if (chart.value) {
      chart.value.dispose();
      chart.value = null;
    }
  });

  return chart;
}
