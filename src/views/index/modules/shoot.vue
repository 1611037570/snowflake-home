<template>
  <!-- 摄影社交平台 -->
  <div class="w-dwh flex-c relative z-10 min-h-dvh flex-col bg-sf-primary py-20" id="shoot">
    <h4 class="group mb-3 flex items-center justify-center text-base font-medium text-sf-text">
      <SfIcon
        icon="lucide:camera"
        size="8"
        class="mr-2 text-sf-theme transition-transform duration-300 group-hover:scale-110"
      />
      部分作品展示
    </h4>
    <div class="flex flex-wrap items-center justify-center gap-2 md:gap-3">
      <template v-for="item in [...imgList].reverse()" :key="item.id">
        <SfImg
          :src="item.img"
          alt=""
          class="h-[240px] w-[160px] rounded-xl md:h-[300px] md:w-[200px]"
        />
      </template>
    </div>

    <p class="my-3 text-center text-sf-text-2">
      已旅拍城市:<span class="text-sf-theme">
        {{ city.length }}
      </span>
    </p>
    <!-- 城市列表：增强动画 -->
    <div class="mb-4 flex flex-wrap justify-center gap-2">
      <span
        v-for="item in city"
        :key="item.name"
        class="rounded-full bg-sf-theme/5 px-2.5 py-1 text-sm text-sf-theme transition-all duration-200 hover:scale-105 hover:bg-sf-theme/15"
      >
        {{ item.name }}
      </span>
    </div>

    <div>全部作品</div>
    <div class="grid grid-cols-2 gap-3">
      <div
        v-for="(item, index) in SHOOT_ACCOUNT"
        :key="index"
        @click.prevent="urlNavigation(item.url)"
        class="group relative flex overflow-hidden rounded-xl border border-sf-theme-hover/20 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sf-theme/30 hover:bg-sf-theme/5 hover:shadow-md"
      >
        <SfIcon
          :icon="item.icon"
          class="mr-3 h-5 w-5 transition-all duration-300 group-hover:scale-110"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { SHOOT_ACCOUNT } from '@/constants'
import { urlNavigation } from '@/utils'
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
    name: '桐乡',
  },
  {
    name: '海盐',
  },
  {
    name: '嘉善',
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
    name: '平潭',
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
]
</script>
