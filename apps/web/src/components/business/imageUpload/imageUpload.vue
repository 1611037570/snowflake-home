<script setup>
import Cropper from "cropperjs";
import { ref } from "vue";
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

// ===== 裁切弹窗状态 =====
const cropVisible = ref(false);
const cropSrc = ref("");
const cropImgRef = ref(null);
let cropper = null;

// 选择文件：暂存图片并打开裁切弹窗，先按组件宽高比裁切
const handleChange = (uploadFile) => {
  const rawFile = uploadFile?.raw;
  if (!rawFile) return;
  cropSrc.value = URL.createObjectURL(rawFile);
  cropVisible.value = true;
};

// 图片加载完成后初始化裁切器，裁切框锁定为组件宽高比
const initCropper = () => {
  if (cropper) cropper.destroy();
  cropper = new Cropper(cropImgRef.value, {
    container: ".cropper-box",
    aspectRatio: props.width / props.height,
    viewMode: 1,
    autoCropArea: 1,
    background: false,
  });
};

// 确认裁切：取裁切区域 canvas，再压缩到目标尺寸
const confirmCrop = async () => {
  const selection = cropper?.getCropperSelection();
  if (!selection) return;
  try {
    const canvas = await selection.$toCanvas();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    const { src } = await compressImage(blob, props.width * 2, props.height * 2);
    image.value = src;
    closeCrop();
  } catch (err) {
    console.error("图片裁切压缩失败:", err);
  }
};

// 关闭裁切弹窗：销毁裁切器并释放图片资源
const closeCrop = () => {
  cropVisible.value = false;
  cropper?.destroy();
  cropper = null;
  URL.revokeObjectURL(cropSrc.value);
  cropSrc.value = "";
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

    <!-- 裁切弹窗：上传后先按组件宽高比裁切，确认后再压缩 -->
    <SfModal v-model="cropVisible" title="裁剪图片">
      <div
        class="cropper-box flex w-full items-center justify-center overflow-hidden rounded-xl bg-sf-bg"
      >
        <img
          v-if="cropSrc"
          ref="cropImgRef"
          :src="cropSrc"
          alt="裁剪图片"
          class="max-w-full"
          @load="initCropper"
        />
      </div>
      <footer class="mt-4 flex justify-end gap-3">
        <el-button @click="closeCrop">取消</el-button>
        <el-button type="primary" @click="confirmCrop">确认</el-button>
      </footer>
    </SfModal>
  </div>
</template>

<style lang="scss" scoped>
/* 裁切器可视区域高度 */
.cropper-box {
  height: 320px;

  :deep(cropper-canvas) {
    max-height: 320px;
  }
}
</style>
