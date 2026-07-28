<template>
  <div class="relative w-full">
    <div
      class="relative h-[600px] w-full rounded-3xl bg-sf-bg-3-hover shadow-sm backdrop-blur-sm md:h-[700px]"
      ref="chartRef"
    ></div>
    <div
      v-if="currentMap !== 'china'"
      @click="backToChina"
      class="absolute top-6 left-6 z-10 flex cursor-pointer items-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-sf-text shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:text-sf-theme"
    >
      <SfIcon icon="lucide:arrow-left" class="mr-1 h-4 w-4" />
      返回全国
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  cityList: {
    type: Array,
    default: () => [],
  },
})

const chartRef = ref(null)
let chartInstance = null
const currentMap = ref('china')
const mapFeatures = ref([])

const initChart = async () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)

  try {
    const res = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
    const geoJson = await res.json()
    mapFeatures.value = geoJson.features
    echarts.registerMap('china', geoJson)
  } catch (error) {
    console.error('获取地图数据失败:', error)
    return
  }

  chartInstance.on('click', async (params) => {
    // 只有在全国地图时才允许下钻到省份
    if (currentMap.value !== 'china') return

    // 找到被点击的省份数据
    const feature = mapFeatures.value.find((f) => f.properties.name === params.name)
    if (!feature || !feature.properties.adcode) return

    const adcode = feature.properties.adcode

    try {
      // 获取省份的地级市数据
      const res = await fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`)
      const provinceGeoJson = await res.json()
      echarts.registerMap(params.name, provinceGeoJson)
      currentMap.value = params.name
      updateChart()
    } catch (e) {
      console.error('获取省份地图数据失败', e)
    }
  })

  updateChart()
}

const backToChina = () => {
  currentMap.value = 'china'
  updateChart()
}

const updateChart = () => {
  if (!chartInstance) return

  const provinceMap = {}
  const cityMap = {}

  props.cityList.forEach((item) => {
    const cityName = item.name
    const provinceName = item.province

    if (provinceName) {
      provinceMap[provinceName] = true
    }

    const fullName =
      cityName.endsWith('市') ||
      cityName.endsWith('区') ||
      cityName.endsWith('县') ||
      cityName.endsWith('州')
        ? cityName
        : `${cityName}市`

    cityMap[fullName] = true
  })

  let mapData = []
  if (currentMap.value === 'china') {
    mapData = Object.keys(provinceMap).map((name) => ({ name, value: 1 }))
  } else {
    // 下钻到省份时，只传入属于当前省份的有足迹城市，避免数据污染其它区域
    mapData = Object.keys(cityMap)
      .filter((cityName) => {
        // 从原始数据列表中查找匹配的城市，确认其所属省份
        const originCity = props.cityList.find(
          (c) =>
            c.name === cityName ||
            `${c.name}市` === cityName ||
            c.name === cityName.replace(/市$/, ''),
        )
        return (
          originCity && (originCity.province === currentMap.value || currentMap.value === '重庆市')
        )
      })
      .map((name) => ({ name, value: 1 }))
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        // 当 mapData 中有该区域的 value 值时，说明有足迹
        // 同时确保不要在提示框里误报当前没显示的其它省份数据
        if (params.seriesType === 'map' && params.value === 1) {
          if (currentMap.value === 'china') {
            // 在全国地图上悬停省份时，去数据源中匹配出该省份下真实去过的所有城市
            const visitedCities = props.cityList
              .filter((c) => c.province === params.name)
              .map((c) => c.name)
              .join('、')
            return `${params.name}<br/>城市：${visitedCities}`
          }
          return `${params.name}`
        }
        return params.name || ''
      },
    },
    visualMap: {
      show: false,
      min: 0,
      max: 1,
      inRange: {
        color: ['#f3f4f6', '#b3d4ff'], // 未去过 和 去过的区域颜色
      },
    },
    geo: {
      map: currentMap.value,
      roam: true,
      zoom: 1.2,
      scaleLimit: {
        min: 1,
        max: 8,
      },
      label: {
        show: true, // 开启显示名字
        color: '#666',
        fontSize: 10,
      },
      itemStyle: {
        areaColor: '#f3f4f6',
        borderColor: '#e5e7eb',
        borderWidth: 0.5,
      },
      emphasis: {
        itemStyle: {
          areaColor: '#d1e5ff',
        },
        label: {
          show: true, // 悬浮时也显示名字
          color: '#333',
          fontWeight: 'bold',
        },
      },
    },
    series: [
      {
        name: currentMap.value === 'china' ? '省份' : '城市区域',
        type: 'map',
        geoIndex: 0,
        data: mapData,
      },
    ],
  }

  // 加上 true 表示不和之前的配置合并，彻底重绘
  chartInstance.setOption(option, true)
}

watch(
  () => props.cityList,
  () => {
    updateChart()
  },
  { deep: true },
)

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  chartInstance?.resize()
}
</script>
