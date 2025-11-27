<script setup>
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
    ],
  },
  {
    name: '状态色',
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
]
</script>

<template>
  <SfViewContainer>
    <template v-for="item in list" :key="item.name">
      <h1 class="p-4 text-2xl font-bold">{{ item.name }}</h1>
      <div
        class="flex flex-wrap gap-4 rounded-xl bg-sf-primary p-3"
        style="backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px)"
      >
        <div v-for="data in item.list" class="rounded-xl p-4 shadow-2xl" :key="data.class">
          <div class="mb-2 h-18 w-[160px] rounded-xl" :class="data.class"></div>
          <div class="text-sm">
            {{ data.name }}
          </div>
        </div>
      </div>
    </template>
  </SfViewContainer>
</template>

<style lang="scss" scoped></style>
