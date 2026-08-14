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
        <template v-for="item in imgList" :key="item.id">
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
import ShootMap from './shootMap.vue'
const components = import.meta.glob('../../../assets/images/shoot/*', { eager: true })

const imgMap = new Map()
for (const key in components) {
  const matchNum = key.match(/(\d+)/)
  if (matchNum) {
    imgMap.set(Number(matchNum[1]), components[key].default)
  }
}

const imgList = [15, 12, 11, 10, 7, 6, 4, 2, 1].map((id) => ({
  id,
  img: imgMap.get(id),
}))
const city = [
  { name: '杭州', province: '浙江省' },
  { name: '嘉兴', province: '浙江省' },
  { name: '绍兴', province: '浙江省' },
  { name: '上海', province: '上海市' },
  { name: '苏州', province: '江苏省' },
  { name: '贵阳', province: '贵州省' },
  { name: '福州', province: '福建省' },
  { name: '深圳', province: '广东省' },
  { name: '长沙', province: '湖南省' },
  { name: '柳州', province: '广西壮族自治区' },
  { name: '南昌', province: '江西省' },
  { name: '重庆', province: '重庆市' },
  { name: '温州', province: '浙江省' },
  { name: '南宁', province: '广西壮族自治区' },
  { name: '来宾', province: '广西壮族自治区' },
  { name: '黔南布依族苗族自治州', province: '贵州省' },
]
</script>
