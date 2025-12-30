<template>
  <div class="flex h-full w-full flex-col">
    <header
      class="relative flex h-12 items-center justify-start border-b-[0.5px] border-sf-border-base bg-sf-primary p-3 text-sf-base sm:h-14 md:justify-center"
    >
      <div
        class="flex-c top-1/2 left-3 mr-3 cursor-pointer text-xs md:absolute md:-translate-y-1/2 md:text-base"
        @click="back"
      >
        <SfIcon icon="famicons:chevron-back" size="5" />
      </div>
      <div class="flex items-center gap-1 md:gap-2">
        <div class="text-xm font-bold md:text-2xl">{{ title }}</div>
        <div
          v-if="version"
          class="rounded-full bg-sf-theme/10 px-2 py-1 text-xs font-medium text-sf-theme"
        >
          v{{ version }}
        </div>
      </div>
      <div class="flex-c absolute top-1/2 right-3 -translate-y-1/2 gap-1 md:gap-3">
        <slot name="right"></slot>
        <SfTheme />
        <SfLocale />
        <SfDropdown>
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
        </SfDropdown>
      </div>
    </header>
    <main class="w-full flex-1 overflow-hidden bg-sf-bg">
      <slot />
    </main>
    <SfFooter class="text-xs" />
  </div>
</template>

<script setup>
import { PAGE_LIST } from '@/constants'

const router = useRouter()
const route = useRoute()

// 从items数组中获取当前路由的标题
const title = computed(() => {
  const currentItem = PAGE_LIST.value.find((item) => item.url === route.path)
  return currentItem?.name || ''
})

// 获取当前路由的版本号
const version = computed(() => {
  const currentItem = PAGE_LIST.value.find((item) => item.url === route.path)
  return currentItem?.version || ''
})

const list = computed(() => {
  // 过滤当前路由匹配的菜单项
  return PAGE_LIST.value.filter((item) => route.path !== item.url)
})

function handleClick(item) {
  router.push(item.url)
}
function back() {
  router.push('/home')
}
</script>

<style scoped></style>
