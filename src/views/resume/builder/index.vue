<script setup>
import { markRaw, ref } from 'vue'
import Custom from './page/custom/index.vue'
import Editor from './page/editor/index.vue'
import Template from './page/template/index.vue'

// 菜单配置
const menuList = [
  {
    name: '简历',
    icon: 'lucide:file-text',
    component: markRaw(Editor),
  },
  {
    name: '模板',
    icon: 'lucide:layout-template',
    component: markRaw(Template),
  },
  {
    name: '自定义',
    icon: 'lucide:palette',
    component: markRaw(Custom),
  },
]

// 当前选中的菜单索引
const activeIndex = ref(0)

// 切换菜单
function handleMenuClick(index) {
  activeIndex.value = index
}
</script>

<template>
  <div class="flex h-full w-full bg-sf-bg text-sf-base">
    <!-- 左侧栏 -->
    <div class="relative w-15 shrink-0">
      <div
        class="sidebar group absolute top-0 left-0 z-10 flex h-full w-full flex-col gap-3 overflow-hidden bg-sf-primary text-sf-base transition-[width] duration-300 hover:w-30"
      >
        <div
          v-for="(item, index) in menuList"
          :key="item.name"
          class="mx-2 flex cursor-pointer items-center justify-center rounded-lg p-2 hover:bg-sf-bg-hover"
          :class="{ 'bg-sf-bg-hover': activeIndex === index }"
          @click="handleMenuClick(index)"
        >
          <SfIcon :icon="item.icon" size="6" />
          <span
            class="max-w-0 overflow-hidden text-sm font-medium whitespace-nowrap opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-xs group-hover:opacity-100"
            >{{ item.name }}</span
          >
        </div>
      </div>
    </div>

    <!-- 右侧内容 -->
    <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
      <component :is="menuList[activeIndex].component" class="h-full overflow-hidden" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sidebar {
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
}
</style>
