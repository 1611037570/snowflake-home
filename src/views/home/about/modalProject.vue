<template>
  <div class="mx-auto max-w-2xl p-6">
    <div class="mb-4 text-2xl font-bold text-blue-600" @click="goMe">小羊</div>
    <!-- 项目运行时间卡片 -->
    <div
      class="mb-8 rounded-xl border border-blue-100 bg-blue-50 p-6 text-center shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <h3 class="mb-2 text-lg font-medium text-blue-600">项目已运行</h3>
      <p
        class="text-2xl font-bold text-blue-600 transition-colors duration-200 hover:text-blue-700"
      >
        {{ runTimeDescription }}
      </p>
      <div class="mt-3 text-sm text-blue-500">自 {{ startTime }} 以来</div>
    </div>

    <!-- 项目历程标题 -->
    <h4 class="mb-5 text-lg font-medium text-blue-600">项目发展历程</h4>

    <!-- 项目历程时间线 -->
    <div class="relative">
      <!-- 时间线垂直轴 -->
      <div class="absolute top-0 bottom-0 left-4 w-px bg-blue-100"></div>

      <!-- 时间线条目 -->
      <div v-for="item in timeList" :key="item.time" class="group relative ml-12">
        <!-- 时间线圆点 -->
        <div class="absolute -left-12 mt-1.5 flex items-center justify-center">
          <div
            class="h-8 w-8 rounded-full border-4 border-white bg-blue-500 shadow-sm transition-transform duration-200 group-hover:scale-110"
          ></div>
        </div>

        <!-- 时间戳 -->
        <div class="group mb-2 pt-1">
          <div
            class="text-lg font-semibold text-blue-600 transition-colors duration-200 group-hover:text-blue-700"
          >
            {{ item.time }}
          </div>
        </div>

        <!-- 描述内容 -->
        <div
          class="rounded-lg border border-blue-50 bg-white p-4 shadow-sm transition-all duration-300 group-hover:border-blue-200"
        >
          <div v-for="(listItem, listIndex) in item.list" :key="listIndex" class="mb-2 last:mb-0">
            <div class="flex items-center">
              <span class="text-gray-600 transition-colors duration-200 hover:text-blue-600">{{
                listItem.desc
              }}</span>
              <div
                v-if="listItem.type && typeMap[listItem.type]"
                :class="[
                  'ml-2 rounded-full border px-2 py-0.5 text-xs transition-all duration-200',
                  typeMap[listItem.type].textColor,
                  typeMap[listItem.type].bgColor,
                  typeMap[listItem.type].borderColor,
                ]"
              >
                {{ typeMap[listItem.type].name }}
              </div>
            </div>
          </div>

          <!-- 图片展示 -->
          <div v-if="item.img && item.img.length" class="mt-4">
            <ElImage
              v-for="(img, imgIndex) in item.img"
              :key="imgIndex"
              :src="img"
              class="mx-auto w-full max-w-md cursor-pointer rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg"
              :preview-src-list="item.img"
              fit="contain"
              lazy
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import startImg from '@/assets/images/start.jpg'
import version1 from '@/assets/images/version1.webp'
import version2 from '@/assets/images/version2.webp'
import { urlNavigation } from '@/utils'
import dayjs from 'dayjs'

function goMe() {
  urlNavigation('/my')
}

// 项目开始时间
const startTime = '2020-09-03'

// 计算项目运行天数
const runDays = computed(() => {
  const start = dayjs(startTime)
  const now = dayjs()
  return now.diff(start, 'day')
})

// 计算项目运行时间的详细描述
const runTimeDescription = computed(() => {
  const start = dayjs(startTime)
  const now = dayjs()

  const years = now.diff(start, 'year')
  const months = now.diff(start.add(years, 'year'), 'month')
  const days = now.diff(start.add(years, 'year').add(months, 'month'), 'day')

  let description = `${runDays.value}天`

  // 如果超过一年，显示更详细的信息
  if (years > 0) {
    description += `（${years}年${months}个月${days}天）`
  } else if (months > 0) {
    description += `（${months}个月${days}天）`
  }

  return description
})
// 项目类型映射，包含名称和颜色方案
const typeMap = {
  frame: {
    name: '架构',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-100 hover:bg-blue-200',
    borderColor: 'border-blue-300',
  },
  new: {
    name: '新增',
    textColor: 'text-green-700',
    bgColor: 'bg-green-100 hover:bg-green-200',
    borderColor: 'border-green-300',
  },
  optimize: {
    name: '优化',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-100 hover:bg-orange-200',
    borderColor: 'border-orange-300',
  },
  fix: {
    name: '修复',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-100 hover:bg-purple-200',
    borderColor: 'border-purple-300',
  },
  del: {
    name: '删除',
    textColor: 'text-red-700',
    bgColor: 'bg-red-100 hover:bg-red-200',
    borderColor: 'border-red-300',
  },
}
// 项目发展时间线数据
const timeList = [
  {
    version: '5.0',
    time: '2025-11-22',
    list: [{ desc: 'UI玻璃化', type: 'frame' }],
  },
  {
    version: '4.2',
    time: '2025-07-18',
    list: [{ desc: '新增简历系统，快速制作属于自己的简历。', type: 'frame' }],
  },
  {
    version: '未标注版本',
    time: '2024-11-22',
    list: [{ desc: '项目使用vue3 + vite + typescript 重构', type: 'frame' }],
  },
  {
    version: '2.2',
    time: '2023-07-18',
    list: [{ desc: '上线修图', type: 'new' }],
  },
  {
    version: '2.2',
    time: '2022-11-22',
    list: [{ desc: '上线便利贴，轻松记录。', type: 'new' }],
  },
  {
    version: '2.1',
    time: '2022-07-18',
    list: [{ desc: '上线娱乐小组件，摸鱼神器。', type: 'new' }],
  },
  {
    version: '2.0',
    time: '2021-11-22',
    img: [version2],
    list: [{ desc: 'UI苹果化', type: 'optimize' }],
  },
  {
    version: '1.1',
    time: '2020-12-07',
    list: [
      { desc: '快捷方式右键菜单', type: 'new' },
      { desc: '快捷方式自动获取icon', type: 'new' },
    ],
  },
  {
    version: '1.0',
    time: '2020-11-22',
    img: [version1],
    list: [
      { desc: 'UI美化', type: 'optimize' },
      { desc: '系统设置', type: 'new' },
      { desc: '搜索栏设置', type: 'new' },
    ],
  },
  {
    version: '0.4',
    time: '2020-10-30',
    list: [
      { desc: '快捷方式添加', type: 'new' },
      { desc: '快捷方式拖拽排序', type: 'new' },
    ],
  },
  {
    version: '0.3',
    time: '2020-10-08',
    list: [{ desc: '搜索栏快捷键', type: 'new' }],
  },
  {
    version: '0.2',
    time: '2020-09-30',
    list: [
      { desc: '搜索栏自定义搜索源', type: 'new' },
      { desc: '搜索栏历史记录', type: 'new' },
      { desc: '搜索栏一键翻译', type: 'new' },
    ],
  },
  {
    version: '0.1',
    time: '2020-09-03',
    img: [startImg],
    list: [{ desc: '梦开始的地方，[nannan.work]站点启用', type: 'new' }],
  },
]
</script>
