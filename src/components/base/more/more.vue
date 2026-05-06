<script setup>
import { BASE_PAGE, MUSE_PAGE, PROJECT_PAGE } from '@/constants'
import MoreList from './list.vue'

const showMore = ref(false)
const list = computed(() => {
  return [
    {
      name: '项目级模块',
      tip: '完整可用的功能项目',
      routers: PROJECT_PAGE.value,
    },
    {
      name: '项目基建',
      tip: '支撑网站的基础模块',
      routers: BASE_PAGE.value,
    },

    {
      name: '小灵光',
      tip: '创意实验的半成品~',
      routers: MUSE_PAGE.value,
    },
  ]
})
</script>

<template>
  <div @click="showMore = true">
    <slot>
      <button
        type="button"
        class="h-8 cursor-pointer rounded-full border-2 border-sf-theme bg-sf-theme/10 px-[18px] text-sm font-black text-sf-theme"
      >
        {{ $t('moreTools') }}
      </button>
    </slot>
    <SfModal v-model="showMore" :title="$t('moreTools')">
      <div class="flex w-[460px] flex-col">
        <MoreList v-for="item in list" :key="item.name" :data="item" @onClick="handleClick" />
      </div>
    </SfModal>
  </div>
</template>

<style lang="scss" scoped></style>
