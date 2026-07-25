<template>
  <!-- 摄影社交平台 -->
  <div class="w-dwh flex-c relative z-10 flex-col bg-sf-bg py-24" id="shoot">
    <div class="flex w-full max-w-[1200px] flex-col items-center">
      <h4 class="group mb-8 flex items-center justify-center text-xl font-medium text-sf-text">
        <SfIcon
          icon="lucide:camera"
          size="24"
          class="mr-3 text-sf-theme transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12"
        />
        部分作品展示
      </h4>

      <div class="mb-12 flex flex-wrap items-center justify-center gap-4 md:gap-6">
        <template v-for="item in [...imgList].reverse()" :key="item.id">
          <div
            class="group overflow-hidden rounded-2xl shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
          >
            <SfImg
              :src="item.img"
              alt=""
              class="h-[240px] w-[160px] object-cover transition-transform duration-500 group-hover:scale-105 md:h-[300px] md:w-[200px]"
            />
          </div>
        </template>
      </div>

      <div class="mb-6 flex w-full flex-col items-center">
        <p class="mb-4 text-center text-sf-text-2">
          已旅拍城市：<span class="text-lg font-semibold text-sf-theme">
            {{ city.length }}
          </span>
        </p>
        <!-- 中国足迹地图 -->
        <ShootMap :city-list="city" />
      </div>

      <div class="mt-8 flex w-full flex-col items-center">
        <div class="mb-6 flex items-center justify-center text-sf-text-2">
          <div class="mr-4 h-[1px] w-16 bg-gradient-to-l from-sf-border/50 to-transparent"></div>
          <span class="text-sm font-medium tracking-wider">全部作品</span>
          <div class="ml-4 h-[1px] w-16 bg-gradient-to-r from-sf-border/50 to-transparent"></div>
        </div>

        <div class="flex justify-center gap-4">
          <div
            v-for="(item, index) in SHOOT_ACCOUNT"
            :key="index"
            @click.prevent="urlNavigation(item.url)"
            class="group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-sf-border/50 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sf-theme/30 hover:bg-sf-theme/5 hover:shadow-lg"
          >
            <SfIcon
              :icon="item.icon"
              class="h-6 w-6 transition-all duration-300 group-hover:scale-125 group-hover:text-sf-theme"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { SHOOT_ACCOUNT } from '@/constants'
import { urlNavigation } from '@/utils'
import ShootMap from '../components/shootMap.vue'
const components = import.meta.glob('../../../assets/images/shoot/*', { eager: true })

function getImg(id) {
  for (const key of Object.keys(components)) {
    const matchNum = key.match(/(\d+)/)
    if (matchNum && Number(matchNum[1]) === id) {
      return components[key].default
    }
  }
}
const imgList = ref([
  {
    id: 1,
  },
  {
    id: 2,
  },
  {
    id: 4,
  },
  {
    id: 6,
  },
  {
    id: 7,
  },
  {
    id: 10,
  },
  {
    id: 11,
  },
  {
    id: 12,
  },
  {
    id: 15,
  },
])
const init = ref(false)

function initImgList() {
  for (const item of imgList.value) {
    item.img = getImg(item.id)
  }
  init.value = true
}
initImgList()
const city = [
  {
    name: '杭州',
  },
  {
    name: '嘉兴',
  },
  {
    name: '绍兴',
  },
  {
    name: '上海',
  },
  {
    name: '苏州',
  },
  {
    name: '贵阳',
  },
  {
    name: '福州',
  },
  {
    name: '深圳',
  },
  {
    name: '长沙',
  },
  {
    name: '柳州',
  },
  {
    name: '南昌',
  },
  {
    name: '重庆',
  },
  {
    name: '温州',
  },
  {
    name: '南宁',
  },
  {
    name: '来宾',
  },
  {
    name: '黔南布依族苗族自治州',
  },
]
</script>
