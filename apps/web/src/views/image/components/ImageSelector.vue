<template>
  <div
    ref="dropZoneRef"
    class="flex-c border-sf-primary-theme relative h-full flex-1 cursor-pointer flex-col overflow-hidden rounded-xl border-2 border-dashed border-sf-bg bg-sf-primary transition-all hover:border-sf-theme-2 hover:bg-sf-theme/10 hover:shadow-md"
    :class="{ 'border-sf-theme bg-sf-theme/20': isOverDropZone }"
    @click="handleClick"
  >
    <SfIcon icon="material-symbols:image-outline" size="34" class="mb-3 text-sf-theme" />
    <div class="text-base text-sf-theme">{{ $t("image.selectorHint") }}</div>
    <div class="flex gap-2">
      <span>支持JPG、PNG、WebP、SVG，建议大小≤60MB。</span>
    </div>

    <div class="flex-c flex-col p-3 text-sm">
      <h3 class="mb-1 flex items-center gap-2 font-semibold">功能简介</h3>
      <div class="flex gap-2">
        <span>支持裁切、压缩、转换类型。</span>
      </div>
      <div class="flex gap-2">
        <span>本地处理，无泄漏隐私。</span>
      </div>

      <div class="flex gap-2">
        <span>完全免费，免注册登录。</span>
      </div>
    </div>
  </div>
</template>

<script setup>
// 定义组件事件：文件选择和点击选择事件
const emit = defineEmits(["file-selected", "select-click"]);

// 拖放区域引用
const dropZoneRef = ref();

// 使用 useDropZone 处理拖放功能
const { isOverDropZone } = useDropZone(dropZoneRef, {
  dataTypes: ["Files"], // 只接受文件类型
  onDrop: (files) => {
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      if (fileList.length === 1) {
        // 单个文件：直接触发选择事件
        emit("file-selected", fileList[0]);
      } else {
        // 多个文件：显示警告信息
        ElMessage.warning($t("image.selectorOneFile"));
      }
    }
  },
});

// 处理点击事件：触发选择点击事件
const handleClick = () => {
  emit("select-click");
};
</script>
