<script setup>
import ThumbPreview from "@/views/resumeEditor/preview/thumbPreview.vue";

defineProps({
  // 简历数据，传入后自动渲染缩略预览，内容由调用方通过默认插槽传入；不传则仅显示默认插槽（如新建简历卡片）
  item: { type: Object, default: null },
  // 缩略预览底部按钮文字
  actionText: { type: String, default: "编辑" },
});

const emit = defineEmits(["click"]);

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
    class="group relative flex h-[344px] w-[242px] cursor-pointer flex-col overflow-hidden rounded-3xl border border-sf-b bg-sf-primary transition-all duration-200 hover:scale-102 hover:border-sf-theme"
    @click="emit('click')"
  >
    <!-- 有 item 数据时渲染标准简历卡片 -->
    <template v-if="item">
      <ThumbPreview :item="getThumbItem(item)" :action-text="actionText" @select="emit('click')" />
      <div
        class="absolute inset-x-0 top-[50%] bottom-0 z-10 flex flex-col justify-end bg-linear-to-t from-white via-white/90 to-transparent px-3 pb-3"
      >
        <slot />
      </div>
    </template>
    <!-- 无 item 数据时使用默认插槽（如新建简历卡片） -->
    <slot v-else />
  </div>
</template>

<style lang="scss" scoped></style>
