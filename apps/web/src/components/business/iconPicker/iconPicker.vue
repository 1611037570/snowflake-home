<script setup lang="ts">
import { computed, ref } from "vue";

defineOptions({ name: "IconPicker" });

const modelValue = defineModel("modelValue", { type: String, default: "" });

interface IconOption {
  key: string;
  icon: string;
  name?: string;
}

interface IconCategory {
  key: string;
  name: string;
  icons: IconOption[];
}

// 图标展示尺寸（Tailwind 间距单位，即设计稿 px ÷ 4）
const props = withDefaults(
  defineProps<{ size?: number; categories: IconCategory[]; allCategoryName?: string }>(),
  {
    size: 5,
    allCategoryName: "全部",
  },
);

// 内建的"全部"分类，展示所有图标
const allCategory = computed(() => ({ key: "all", name: props.allCategoryName }));

// 当前选中的分类 key，all 表示显示全部
const activeCategory = ref("all");

// 全部图标平铺列表
const allIcons = computed(() => props.categories.flatMap((category) => category.icons));

// 当前分类下的图标列表
const currentIcons = computed(() =>
  activeCategory.value === "all"
    ? allIcons.value
    : (props.categories.find((cat) => cat.key === activeCategory.value)?.icons ?? []),
);

// 当前选中图标信息，供触发区域展示
const activeIcon = computed(() => allIcons.value.find((item) => item.key === modelValue.value));

// 选择图标只保存稳定标识，实际图标名称由目录解析
const selectIcon = (key: string) => {
  modelValue.value = key;
};
</script>

<template>
  <!-- 下拉选择：触发区域默认仅展示当前选中图标，点击展开面板选择 -->
  <SfDropdown trigger="click" popper-class="icon-picker-popper" @command="selectIcon">
    <SfIcon
      :icon="activeIcon?.icon || 'mdi:shape-outline'"
      :size="size"
      class="rounded-3xl text-sf-text! hover:bg-sf-theme-2 hover:text-sf-theme-text"
      :boxSize="size + 2"
    />

    <template #dropdown>
      <div class="w-80 rounded-3xl border border-sf-b bg-sf-primary p-3">
        <!-- 分类切换：全部 + 各业务分类 -->
        <div class="mb-3 flex flex-wrap gap-2">
          <button
            v-for="item in [allCategory, ...props.categories]"
            :key="item.key"
            class="h-7 cursor-pointer rounded-full px-2 text-xs font-medium transition-all duration-200"
            :class="
              activeCategory === item.key
                ? 'bg-sf-bg text-sf-text'
                : 'text-sf-text-2 hover:bg-sf-bg-2'
            "
            @click="activeCategory = item.key"
          >
            {{ item.name }}
          </button>
        </div>
        <!-- 图标网格：均为菜单项，点击即选中并关闭下拉 -->
        <SfScrollbar class="min-h-[200px]" height="200px">
          <div class="grid grid-cols-6 gap-3">
            <SfIcon
              v-for="item in currentIcons"
              :key="item.key"
              :icon="item.icon"
              :size="size"
              :boxSize="size + 3"
              @click="selectIcon(item.key)"
              class="rounded-3xl"
              :class="[
                modelValue === item.key
                  ? ' bg-sf-theme text-sf-theme-text'
                  : 'text-sf-text! hover:bg-sf-bg',
              ]"
            />
          </div>
        </SfScrollbar>
      </div>
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped>
// 覆盖 element-plus 下拉菜单默认样式，保持图标网格布局
:deep(.el-dropdown-menu) {
  background: transparent;
}
</style>
