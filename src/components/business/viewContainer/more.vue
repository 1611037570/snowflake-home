<script setup>
import { BASE_PAGE, PROJECT_PAGE } from '@/constants'

const router = useRouter()
const route = useRoute()

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

<template>
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
</template>

<style lang="scss" scoped></style>
