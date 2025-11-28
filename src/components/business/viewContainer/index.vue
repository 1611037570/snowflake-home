<template>
  <div class="flex h-full w-full flex-col">
    <header
      class="flex-c relative h-14 border-b-[0.5px] border-sf-text-3 bg-sf-primary p-3 text-sf-base"
    >
      <div class="flex-c absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer" @click="back">
        <SfIcon icon="famicons:chevron-back" size="5" />
        返回主站
      </div>
      <div class="flex items-center gap-2">
        <div class="text-2xl font-bold">{{ title }}</div>
        <div
          v-if="version"
          class="rounded-full bg-sf-theme/10 px-2 py-1 text-xs font-medium text-sf-theme"
        >
          v{{ version }}
        </div>
      </div>
      <div class="flex-c absolute top-1/2 right-3 -translate-y-1/2">
        <slot name="right"></slot>
        <SfTheme class="mx-3" />
        <SfLocale class="mr-3" />
        <ElDropdown>
          <ElButton> {{ $t('moreTools') }} </ElButton>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="(item, index) in list"
                :key="item.url"
                :divided="index > 0 && index !== list.length"
                @click="handleClick(item)"
                >{{ item.name }}</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </ElDropdown>
      </div>
    </header>
    <main class="w-full flex-1 overflow-hidden">
      <slot />
    </main>
    <SfFooter />
  </div>
</template>

<script setup>
import { pageList } from '@/datas/page.data'

const router = useRouter()
const route = useRoute()

// 从items数组中获取当前路由的标题
const title = computed(() => {
  const currentItem = pageList.value.find((item) => item.url === route.path)
  return currentItem?.name || ''
})

// 获取当前路由的版本号
const version = computed(() => {
  const currentItem = pageList.value.find((item) => item.url === route.path)
  return currentItem?.version || ''
})

// 更新HTML标题
useTitle(title)
const list = computed(() => {
  // 过滤当前路由匹配的菜单项
  return pageList.value.filter((item) => route.path !== item.url)
})

function handleClick(item) {
  router.push(item.url)
}
function back() {
  router.push('/home')
}
</script>

<style scoped></style>
