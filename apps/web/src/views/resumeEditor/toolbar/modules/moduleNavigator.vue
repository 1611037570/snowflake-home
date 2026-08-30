<script setup>
// 模块导航：右侧工具栏入口，按钮左侧展开非模态悬浮面板，点击模块联动跳转预览区与编辑区
import { onBeforeUnmount, onMounted, ref } from "vue";
import Icon from "../components/icon.vue";
import { useModuleNav } from "../../useModuleNav";

const visible = ref(false);
const panelRef = ref(null);
const { keyword, filteredList, jumpAll } = useModuleNav();

// 联动跳转后收起面板（隐藏模块由 jumpAll 内部先恢复再定位）
const handleJump = (m) => {
  jumpAll(m.key);
  visible.value = false;
};

// 点击面板外区域收起
const closeOnOutside = (e) => {
  if (visible.value && panelRef.value && !panelRef.value.contains(e.target)) {
    visible.value = false;
  }
};
onMounted(() => document.addEventListener("click", closeOnOutside));
onBeforeUnmount(() => document.removeEventListener("click", closeOnOutside));
</script>

<template>
  <div ref="panelRef" class="relative">
    <Icon icon="mdi:map-search-outline" size="4" content="查找模块" @click="visible = !visible" />

    <!-- 非模态悬浮面板：从按钮左侧展开 -->
    <div
      v-if="visible"
      class="absolute top-0 right-full z-90 mr-6 w-60 rounded-2xl border border-sf-b bg-sf-primary p-3 shadow-lg"
    >
      <!-- 功能提示 -->
      <div class="mb-2 text-xs text-sf-text-2">点击模块，同步定位到预览区与编辑区</div>
      <SfInput v-model="keyword" placeholder="搜索模块" clearable />
      <div class="mt-2 flex max-h-[300px] flex-col gap-1 overflow-y-auto">
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
        <div v-if="!filteredList.length" class="py-4 text-center text-xs text-sf-text-2">
          未找到相关模块
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
