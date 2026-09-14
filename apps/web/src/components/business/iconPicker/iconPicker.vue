<script setup lang="ts">
import { computed, ref } from "vue";
import { ICON_CATEGORIES } from "@/configs";

defineOptions({ name: "IconPicker" });

const modelValue = defineModel("modelValue", { type: String, default: "" });

// 图标展示尺寸（Tailwind 间距单位，即设计稿 px ÷ 4）
const props = withDefaults(defineProps<{ size?: number }>(), {
  size: 5,
});

// 内建的"全部"分类，展示所有图标
const allCategory = { key: "all", name: "全部" };

// 当前选中的分类 key，all 表示显示全部
const activeCategory = ref("all");

// 全部图标平铺列表
const allIcons = computed(() => ICON_CATEGORIES.flatMap((cat) => cat.icons));

// 当前分类下的图标列表
const currentIcons = computed(() =>
  activeCategory.value === "all"
    ? allIcons.value
    : (ICON_CATEGORIES.find((cat) => cat.key === activeCategory.value)?.icons ?? []),
);

// 选择图标并写入 v-model
const selectIcon = (icon: string) => {
  modelValue.value = icon;
};
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- 分类切换：全部 + 各业务分类 -->
    <div class="flex flex-wrap gap-3">
      <button
        v-for="item in [allCategory, ...ICON_CATEGORIES]"
        :key="item.key"
        type="button"
        class="h-8 cursor-pointer rounded-full border px-3 text-sm font-medium transition-all duration-200"
        :class="
          activeCategory === item.key
            ? 'border-sf-theme bg-sf-bg text-sf-primary'
            : 'border-sf-b text-sf-text-2 hover:border-sf-theme'
        "
        @click="activeCategory = item.key"
      >
        {{ item.name }}
      </button>
    </div>
    <!-- 图标网格 -->
    <div class="grid grid-cols-5 gap-3">
      <button
        v-for="item in currentIcons"
        :key="item.icon"
        type="button"
        class="flex aspect-square cursor-pointer items-center justify-center rounded-3xl border transition-all duration-200 hover:scale-105"
        :class="
          modelValue === item.icon
            ? 'border-sf-theme bg-sf-bg text-sf-primary'
            : 'border-sf-b text-sf-text-2 hover:border-sf-theme'
        "
        :title="item.name"
        @click="selectIcon(item.icon)"
      >
        <SFIcon :icon="item.icon" :size="size" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>