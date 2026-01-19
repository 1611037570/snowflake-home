<script setup>
import { useClipboard } from '@vueuse/core'
import { ElMessage } from 'element-plus'
const list = [
  {
    name: '主题色',
    list: [
      {
        name: '主要色',
        class: 'bg-sf-theme',
      },
      {
        name: '次要色',
        class: 'bg-sf-theme-hover',
      },
      {
        name: '主题文字色',
        class: 'bg-sf-theme-text',
      },
    ],
  },
  {
    name: '辅助色',
    list: [
      {
        name: '成功',
        class: 'bg-sf-success',
      },
      {
        name: '错误',
        class: 'bg-sf-error',
      },
      {
        name: '警告',
        class: 'bg-sf-warning',
      },
      {
        name: '信息',
        class: 'bg-sf-info',
      },
    ],
  },
  {
    name: '文本色',
    list: [
      {
        name: '主要文本色',
        class: 'bg-sf-text',
      },
      {
        name: '次要文本色',
        class: 'bg-sf-text-2',
      },
      {
        name: '第三文本色',
        class: 'bg-sf-text-3',
      },
      {
        name: '第四文本色',
        class: 'bg-sf-text-4',
      },
    ],
  },
  {
    name: '背景色',
    list: [
      {
        name: '主要背景色',
        class: 'bg-sf-bg',
      },
      {
        name: '次要背景色',
        class: 'bg-sf-bg-2',
      },
      {
        name: '第三背景色',
        class: 'bg-sf-bg-3',
      },
    ],
  },
  {
    name: '边框',
    list: [
      {
        name: '主要文本色',
        class: 'bg-sf-border',
      },
    ],
  },
]
const { copy } = useClipboard()
function copyClass(cls) {
  copy(cls)
    .then(() => ElMessage.success(`已复制类名: ${cls}`))
    .catch(() => ElMessage.error('复制失败'))
}
</script>

<template>
  <SfViewContainer>
    <ElScrollbar>
      样式定义：src\styles\tailwind.css（展示页会因更新不及时，导致不一致，以样式文件为准）

      <template v-for="item in list" :key="item.name">
        <h1 class="px-4 text-2xl font-bold">{{ item.name }}</h1>
        <div class="flex flex-wrap gap-4 rounded-xl p-1">
          <div class="flex-c relative h-20 w-[150px]" v-for="data in item.list" :key="data.class">
            <div
              class="h-full w-full"
              style="filter: blur(2px); background: rgba(255, 255, 255, 0.5)"
            ></div>
            <div
              class="bg-sf-text-4 flex-c absolute top-1/2 left-1/2 z-10 h-14 w-[120px] -translate-x-1/2 -translate-y-1/2"
              :class="data.class"
              @click="copyClass(data.class)"
            >
              {{ data.name }}
            </div>
          </div>
          <!-- <div
            v-for="data in item.list"
            :key="data.class"
            :class="data.class"
            @click="copyClass(data.class)"
            class="rounded-xl p-3"
            style="
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
              background-color: rgba(255, 255, 255, 0.5);
              /* filter: blur(8px); */
            "
          >
            <div
              class="mb-2 h-14 w-[120px] cursor-pointer rounded-xl transition active:scale-[.99]"
              :class="data.class"
              @click="copyClass(data.class)"
            ></div>
            <div class="text-sm">
              {{ data.name }}
            </div>
          </div> -->
        </div>
      </template>
    </ElScrollbar>
  </SfViewContainer>
</template>

<style lang="scss" scoped></style>
