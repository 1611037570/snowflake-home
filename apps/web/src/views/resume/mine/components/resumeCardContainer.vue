<script setup>
import ThumbPreview from "@/views/resumeEditor/preview/thumbPreview.vue";
import { getResumeTitle } from "../../../resumeEditor/resumeName";

defineProps({
  // 简历数据，传入后自动渲染缩略预览 + 标题 + 求职岗位；不传则仅显示默认插槽（如新建简历卡片）
  item: { type: Object, default: null },
  // 缩略预览底部按钮文字
  actionText: { type: String, default: "编辑" },
});

const emit = defineEmits(["click"]);

// 获取求职岗位
const getResumePosition = (item) => {
  return item?.data?.user?.data?.position || "未填写求职岗位";
};

// 组装缩略预览所需的简历项
const getThumbItem = (item) => ({
  data: item.data,
  config: item.config,
  fixedConfig: item.fixedConfig,
  ui: item.ui,
});
</script>

<template>
  <div
    class="group relative flex h-[394px] w-[282px] cursor-pointer flex-col overflow-hidden rounded-3xl border border-sf-b bg-sf-primary transition-all duration-200 hover:-translate-y-1 hover:border-sf-theme"
    @click="emit('click')"
  >
    <!-- 有 item 数据时渲染标准简历卡片 -->
    <template v-if="item">
      <ThumbPreview :item="getThumbItem(item)" :action-text="actionText" @select="emit('click')" />
      <div
        class="absolute inset-x-0 top-[50%] bottom-0 z-10 flex flex-col justify-end bg-linear-to-t from-white via-white/90 to-transparent px-3 pb-3"
      >
        <!-- 标题与右上角操作插槽 -->
        <div class="mt-3 flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-base font-black text-sf-text">
              {{ getResumeTitle(item.data) }}
            </div>
            <div class="mt-1 truncate text-sm text-sf-text-2">
              {{ getResumePosition(item) }}
            </div>
          </div>
          <slot name="actions" />
        </div>
        <!-- 底部插槽：进度条 / 操作按钮等 -->
        <slot name="footer" />
      </div>
    </template>
    <!-- 无 item 数据时使用默认插槽（如新建简历卡片） -->
    <slot v-else />
  </div>
</template>

<style lang="scss" scoped></style>
