<script setup>
import { BASE_PAGE, MUSE_PAGE, PROJECT_PAGE } from '@/constants'
import MoreList from './list.vue'

const showMore = ref(false)
const router = useRouter()
const list = computed(() => {
  return [
    {
      name: '项目',
      tip: '完整可用的功能项目',
      routers: PROJECT_PAGE.value,
    },
    {
      name: '基建内容',
      tip: '支撑网站的基础模块',
      routers: BASE_PAGE.value,
    },

    {
      name: '灵光一现',
      tip: '创意实验的半成品~',
      routers: MUSE_PAGE.value,
    },
  ]
})

function handleReset() {
  localStorage.removeItem('snowflakeRoute')
  showMore.value = false
  router.push('/init')
}
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
        <MoreList v-for="item in list" :key="item.name" :data="item" />
        <button
          type="button"
          class="mt-1 h-10 cursor-pointer rounded-full border border-sf-theme bg-sf-theme/10 px-8 text-sm font-black text-sf-theme transition hover:bg-sf-theme/15"
          @click.stop="handleReset"
        >
          &#37325;&#32622;&#36215;&#22987;&#39029;
        </button>
      </div>
    </SfModal>
  </div>
</template>

<style lang="scss" scoped></style>
