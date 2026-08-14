import { useDebounceFn } from '@vueuse/core'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import echarts from './echarts'
import data from './walden.json'
console.log('data:>> ', data)

export default function useEcharts(id: string, options: any, config: { resize?: boolean } = {}) {
  const { resize = true } = config
  const chart = ref()
  const init = ref(false)
  async function initChart() {
    await nextTick()
    const dom = document.getElementById(id)
    if (!dom) {
      console.warn('ECharts容器DOM不存在')
      return
    }
    // const walden = JSON.parse(data)
    echarts.registerTheme('walden', data)
    chart.value = echarts.init(dom, 'walden')
    init.value = true
  }

  // 自适应调整图表大小
  const resizeChart = useDebounceFn(() => {
    if (!chart.value) return
    chart.value.resize()
  }, 200)

  onMounted(async () => {
    await initChart()

    // 添加窗口大小变化监听
    if (resize) {
      window.addEventListener('resize', resizeChart)
    }

    watch(
      options,
      (newValue) => {
        if (!newValue) return
        chart.value.setOption(newValue, true)
      },
      {
        deep: true,
        immediate: true,
      },
    )
  })

  onBeforeUnmount(() => {
    if (resize) {
      window.removeEventListener('resize', resizeChart)
    }
    if (chart.value) {
      chart.value.dispose()
      chart.value = null
    }
  })

  return chart
}
