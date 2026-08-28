<script setup>
import Upload from "@/components/el/upload";
import { compressImage } from "./compressImage";

// 默认 1 寸照尺寸：25mm x 35mm @96dpi ≈ 96 x 132px
const DEFAULT_WIDTH = 96;
const DEFAULT_HEIGHT = 132;

const props = defineProps({
  /** 显示宽度（px），默认 1 寸照宽度 */
  width: {
    type: Number,
    default: DEFAULT_WIDTH,
  },
  /** 显示高度（px），默认 1 寸照高度 */
  height: {
    type: Number,
    default: DEFAULT_HEIGHT,
  },
});

const image = defineModel("modelValue", {
  type: String,
  default: "",
});

// 选择图片后压缩到当前显示尺寸的 2 倍，保证清晰度
const handleChange = async (uploadFile) => {
  const rawFile = uploadFile?.raw;
  if (!rawFile) return;
  try {
    const { src } = await compressImage(rawFile, props.width * 2, props.height * 2);
    image.value = src;
  } catch (err) {
    console.error("图片压缩失败:", err);
  }
};

// 清空图片值
const removeImage = () => {
  image.value = "";
};
</script>

<template>
  <!-- 固定整体高度，保证上传前后表单区域不跳动 -->
  <div class="flex shrink-0 items-center gap-3" :style="{ height: `${height}px` }">
    <!-- 始终保留上传入口：未上传展示占位，已上传时点击图片可重新上传替换 -->
    <Upload :auto-upload="false" :show-file-list="false" accept="image/*" @change="handleChange">
      <div
        class="border-sf-border group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed text-sf-text-3 transition-colors hover:border-sf-theme hover:text-sf-theme"
        :style="{ width: `${width}px`, height: `${height}px` }"
        :title="image ? '点击重新上传' : '上传图片'"
      >
        <img v-if="image" :src="image" alt="图片" class="h-full w-full shrink-0 object-cover" />
        <!-- 已上传时鼠标悬停显示"重新上传"遮罩提示 -->
        <div
          v-if="image"
          class="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          重新上传
        </div>
        <div v-else class="flex h-full w-full flex-col items-center justify-center gap-1">
          <SfIcon icon="mdi:image-plus" size="6" />
          <span class="text-xs">上传图片</span>
        </div>
      </div>
    </Upload>

    <SfIcon
      v-if="image"
      icon="ic:round-delete"
      size="4"
      boxSize="8"
      class="cursor-pointer rounded-lg transition-colors hover:text-sf-theme"
      title="删除图片"
      @click="removeImage"
    />
  </div>
</template>
