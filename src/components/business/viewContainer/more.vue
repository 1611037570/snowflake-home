<script setup>
import { BASE_PAGE, MUSE_PAGE, PROJECT_PAGE } from '@/constants'

const router = useRouter()
const route = useRoute()

// 过滤菜单项的条件函数
const filterMenuItems = (item) => {
  // 过滤当前路由和 index 页面
  return route.path !== item.url && item.url !== '/index'
}

const list = computed(() => {
  return [
    {
      name: '基建',
      routers: BASE_PAGE.value.filter(filterMenuItems),
    },
    {
      name: '项目',
      routers: PROJECT_PAGE.value.filter(filterMenuItems),
    },
    {
      name: '小灵光',
      routers: MUSE_PAGE.value.filter(filterMenuItems),
    },
  ]
})
function handleClick(item) {
  router.push(item.url)
}
</script>

<template>
  <SfDropdown trigger="click">
    <ElButton> {{ $t('moreTools') }} </ElButton>
    <template #dropdown>
      <div class="w-48 bg-sf-bg px-2 py-1">
        <!-- 基础页面 -->
        <template v-for="item in list" :key="item.name">
          <div class="mb-1 px-2 text-xs font-semibold text-sf-base">{{ item.name }}</div>
          <div class="mb-2 rounded-lg border border-sf-border shadow-md">
            <SfList
              :list="item.routers"
              activeKey="url"
              activeValue="url"
              @onClick="handleClick"
            ></SfList>
          </div>
        </template>
      </div>
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
