<template>
  <div class="flex h-full w-full flex-col">
    <!-- 标题栏 -->
    <header
      class="relative flex h-12 items-center justify-start border-b-[0.5px] border-sf-border bg-sf-primary p-3 text-sf-base sm:h-14 md:justify-center"
    >
      <div
        class="flex-c top-1/2 left-3 mr-3 cursor-pointer text-xs md:absolute md:-translate-y-1/2 md:text-base"
        @click="defaultNavigation"
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
            <div class="w-48 px-2 py-1">
              <!-- 基础页面 -->
              <div class="text-sf-text-secondary mb-1 px-2 text-xs font-semibold">
                {{ $t('basePage') || '基础页面' }}
              </div>
              <el-dropdown-menu class="mb-2 rounded-lg border border-sf-border shadow-md">
                <el-dropdown-item
                  v-for="(item, index) in baseList"
                  :key="item.url"
                  :divided="index > 0"
                  class="hover:bg-sf-hover px-4 py-1.5 text-sm"
                  @click="handleClick(item)"
                  >{{ item.name }}</el-dropdown-item
                >
              </el-dropdown-menu>

              <!-- 项目页面 -->
              <div class="text-sf-text-secondary mb-1 px-2 text-xs font-semibold">
                {{ $t('projectPage') || '项目页面' }}
              </div>
              <el-dropdown-menu class="rounded-lg border border-sf-border shadow-md">
                <el-dropdown-item
                  v-for="(item, index) in projectList"
                  :key="item.url"
                  :divided="index > 0"
                  class="hover:bg-sf-hover px-4 py-1.5 text-sm"
                  @click="handleClick(item)"
                  >{{ item.name }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </div>
          </template>
        </SfDropdown>
      </div>
    </header>
    <!-- 主内容区域 -->
    <main class="w-full flex-1 overflow-hidden bg-sf-bg-hover">
      <slot />
    </main>
    <SfFooter class="text-xs" />
  </div>
</template>

<script setup>
import { ALL_PAGE, BASE_PAGE, PROJECT_PAGE } from '@/constants'
import { defaultNavigation } from '@/utils'

const router = useRouter()
const route = useRoute()

// 从items数组中获取当前路由的标题
const title = computed(() => {
  const currentItem = ALL_PAGE.value.find((item) => item.url === route.path)
  return currentItem?.name || ''
})

// 获取当前路由的版本号
const version = computed(() => {
  const currentItem = ALL_PAGE.value.find((item) => item.url === route.path)
  return currentItem?.version || ''
})

// 过滤菜单项的条件函数
const filterMenuItems = (item) => {
  // 过滤当前路由和 index 页面
  return route.path !== item.url && item.url !== '/index'
}

const baseList = computed(() => {
  return BASE_PAGE.value.filter(filterMenuItems)
})
const projectList = computed(() => {
  return PROJECT_PAGE.value.filter(filterMenuItems)
})

function handleClick(item) {
  router.push(item.url)
}
</script>

<style scoped></style>
