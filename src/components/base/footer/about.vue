<template>
  <SfModal v-model="modalValue" title="关于项目">
    <ElScrollbar class="h-[600px] w-100" style="height: 600px">
      <div class="flex-c">
        <SfImg
          :src="snowIcon"
          class="h-7.5 w-7.5 transition-all duration-200 hover:rotate-180"
          fit="contain"
        />
      </div>
      <div class="flex">
        运行时长：
        {{ runTime }}天
      </div>
      <div v-for="item in timeList" :key="item.type">
        <div class="flex">时间：{{ item.time }}</div>
        <template v-if="item.list">
          <div v-for="(data, index) in item.list" :key="index">
            {{ data.desc }}
          </div>
        </template>
        <template v-if="item.img">
          <div @click="handleImgClick(item.img)">查看图片</div>
          <SfImg
            v-for="(img, index) in item.img"
            :key="index"
            :src="img"
            class="h-auto w-[400px]"
          />
        </template>
      </div>
    </ElScrollbar>
  </SfModal>
</template>
<script setup>
import snowIcon from '@/assets/images/snow.svg'
import { useSystemStore } from '@/stores'
import startImg from '@/assets/images/start.jpg'
import start from '@/assets/images/start.png'
import version1 from '@/assets/images/version1.webp'
import version2 from '@/assets/images/version2.webp'
import predecessor from '@/assets/images/predecessor.jpg'
function handleImgClick(imgList) {
  console.log(imgList)
}
const modalValue = defineModel()
const systemStore = useSystemStore()
const { runTime } = storeToRefs(systemStore)
const timeList = [
  {
    time: '2025-07-18',
    list: [{ desc: '新增简历系统，快速制作属于自己的简历。', type: 'frame' }],
  },
  {
    time: '2024-11-22',
    list: [{ desc: '项目使用vue3 + vite + typescript 重构', type: 'frame' }],
  },
  {
    time: '2023-07-18',
    list: [{ desc: '上线修图', type: 'new' }],
  },
  {
    time: '2021-11-22',
    img: [version2],
    list: [{ desc: 'UI苹果化', type: 'optimize' }],
  },
  {
    time: '2020-11-22',
    img: [version1],
    list: [{ desc: '雪花起始页正式上线', type: 'optimize' }],
  },
  {
    time: '2020-9-3',
    img: [startImg],
    list: [{ desc: '梦开始的地方，[nannan.work]站点启用，新的起始页上线~', type: 'new' }],
  },
  {
    time: '2016-8-16',
    list: [
      {
        desc: '我的世界生存服最后一个版本，随着网易代理国服，服务器和起始页一并停运~',
        type: 'history',
      },
    ],
    img: [predecessor],
  },
  {
    time: '2015-5-10',
    list: [
      {
        desc: '通过虚拟主机搭建出雪花起始页的前身，用于展示我的世界服务器中的相关信息。',
        type: 'history',
      },
    ],
    img: [start],
  },
]
</script>
