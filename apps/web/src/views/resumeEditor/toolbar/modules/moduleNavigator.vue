<script setup>
// 模块导航：右侧工具栏入口，按钮左侧展开下拉面板，点击模块联动跳转预览区与编辑区
import Icon from "../components/icon.vue";
import { useModuleNav } from "../../useModuleNav";

const { keyword, filteredList, jumpAll } = useModuleNav();

// 联动跳转（隐藏模块由 jumpAll 内部先恢复再定位）
const handleJump = (m) => {
  jumpAll(m.key);
};
</script>

<template>
  <SfDropdown trigger="click" placement="left-start" :show-arrow="false">
    <Icon icon="mdi:map-search-outline" size="5" content="查找模块" />
    <template #dropdown>
      <div class="w-60 rounded-3xl border border-sf-b bg-sf-primary py-3">
        <!-- 功能提示 -->
        <div class="px-3">
          <div class="mb-2 text-xs text-sf-text-2">点击模块，同步定位到编辑和预览区</div>
          <SfInput v-model="keyword" placeholder="搜索模块" clearable />
        </div>
        <div class="mt-2 flex max-h-[300px] flex-col gap-1">
          <SfScrollbar max-height="300px">
            <div
              v-for="m in filteredList"
              :key="m.key"
              class="flex cursor-pointer items-center gap-2 rounded-3xl px-2 py-1.5 text-sm transition-colors hover:bg-sf-theme-2"
              :class="m.hidden ? 'opacity-60' : ''"
              @click="handleJump(m)"
            >
              <SfIcon :icon="m.icon" size="4" class="text-sf-theme" />
              <span class="flex-1 truncate">{{ m.name }}</span>
              <span v-if="m.hidden" class="text-xs text-sf-text-2">已隐藏</span>
            </div>
          </SfScrollbar>
        </div>
      </div>
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
