<script setup>
import ThumbPreview from "@/views/resume/editor/preview/modes/thumb.vue";

const props = defineProps({
  // 简历数据，传入后自动渲染缩略预览，内容由调用方通过默认插槽传入；不传则仅显示默认插槽（如新建简历卡片）
  item: { type: Object, default: null },
  // 大小
  size: { type: String, default: "default" },
});

const emit = defineEmits(["click"]);

// 组装缩略预览所需的简历项
const getThumbItem = (item) => ({
  data: item.data,
  config: item.config,
  ui: item.ui,
});
const boxSize = computed(() => {
  // 只定义宽度，高度由 A4 比例（794:1123）自动派生，调整宽度即可整体缩放
  // 宽度已扣除 1px 描边，配合 content-box 让缩略图可用区正好是 A4，页面不会露出空隙
  if (props.size == "default") {
    return "w-[238px] aspect-[794/1123]";
  } else if (props.size == "small") {
    return "w-[378px] aspect-[794/1123]";
  }
  return "";
});
</script>

<template>
  <div
    :class="boxSize"
    class="group relative box-content flex cursor-pointer flex-col overflow-hidden rounded-[4px] border border-sf-b bg-sf-primary transition-all duration-200 hover:scale-102 hover:border-sf-theme"
    @click="emit('click')"
  >
    <!-- 卡片右上角操作入口由调用方按需注入。 -->
    <div
      class="invisible absolute top-3 right-3 z-20 opacity-0 transition-opacity duration-200 group-hover:visible group-hover:opacity-100"
      @click.stop
    >
      <slot name="actions" />
    </div>
    <!-- 有 item 数据时渲染标准简历卡片 -->
    <template v-if="item && size">
      <ThumbPreview :item="getThumbItem(item)" @select="emit('click')" />
      <!-- 底部信息条：纯色背景且高度随内容，不再用半透明渐变遮挡简历缩略图 -->
      <div
        class="absolute inset-x-0 bottom-0 z-10 flex flex-col border-t border-sf-b bg-sf-primary p-2"
      >
        <slot />
      </div>
    </template>
    <!-- 无 item 数据时使用默认插槽（如新建简历卡片） -->
    <slot v-else />
  </div>
</template>

<style lang="scss" scoped></style>
