<script setup>
import { markRaw, ref } from 'vue'
import Custom from './Custom.vue'
import Resume from './Resume.vue'
import Template from './Template.vue'

// 菜单配置
const menuList = [
  {
    name: '简历',
    icon: 'document',
    component: markRaw(Resume),
  },
  {
    name: '模板',
    icon: 'template',
    component: markRaw(Template),
  },
  {
    name: '自定义',
    icon: 'settings',
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
    <div class="relative w-12 shrink-0">
      <div
        class="sidebar absolute top-0 left-0 z-10 h-full w-full overflow-hidden bg-sf-primary text-sf-base transition-all duration-300 ease-in-out hover:w-30"
      >
        <div class="flex h-full flex-col space-y-4 p-2">
          <div
            v-for="(item, index) in menuList"
            :key="item.name"
            class="flex cursor-pointer items-center space-x-2 rounded-lg p-2 transition-colors hover:bg-white/10"
            :class="{ 'bg-white/20': activeIndex === index }"
            @click="handleMenuClick(index)"
          >
            <SfIcon :name="item.icon" size="6" class="shrink-0" />
            <span class="text-sm font-medium whitespace-nowrap">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容 -->
    <div class="relative flex flex-1 flex-col overflow-hidden">
      <component :is="menuList[activeIndex].component" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sidebar {
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
}
</style>
