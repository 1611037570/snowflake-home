<script setup>
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { ref, watch } from "vue";
import { useImageUpload } from "@/hooks";
import { routerNavigation, toAvatarSrc } from "@/utils";

// 新窗口打开 image 工具页
const goImageTools = () => routerNavigation("/image");

// 默认 1 寸照尺寸：25mm x 35mm @96dpi ≈ 96 x 132px
const DEFAULT_WIDTH = 72;
const DEFAULT_HEIGHT = 98;

const props = defineProps({
  /** 显示宽度（px），默认 1 寸照宽度 */
  width: {
    type: Number,
    default: 72,
  },
  /** 显示高度（px），默认 1 寸照高度 */
  height: {
    type: Number,
    default: 98,
  },
});

const image = defineModel("modelValue", {
  type: String,
  default: "",
});

// 图片查看器显隐
const previewVisible = ref(false);

// 图片上传全流程 hook：vueuse 选择文件，内部完成裁切压缩并返回裸 base64
const { openPicker, cropVisible, cropSrc, confirmCrop, closeCrop } = useImageUpload({
  crop: true,
  outputWidth: props.width * 0.7,
  outputHeight: props.height * 0.7,
  onResult: (base64) => {
    image.value = base64;
  },
});

// ===== 裁切弹窗状态 =====
const cropImgRef = ref(null);
let cropper = null;

// 弹窗关闭时同步销毁裁切器（含右上角关闭等场景）
watch(cropVisible, (visible) => {
  if (!visible && cropper) {
    cropper.destroy();
    cropper = null;
  }
});

// 图片加载完成后初始化裁切器，裁切框锁定为组件宽高比
const initCropper = () => {
  if (cropper) cropper.destroy();
  cropper = new Cropper(cropImgRef.value, {
    // 固定按组件宽高比裁切，不支持更改
    aspectRatio: props.width / props.height,
    // 最大化利用空间，裁剪区域不超出图片
    viewMode: 2,
    guides: true,
    center: true,
    autoCropArea: 0.8,
    movable: true,
    zoomable: true,
    cropBoxMovable: true,
    cropBoxResizable: true,
    // 开启背景棋盘格，图片未覆盖区域显示透明格纹
    background: true,
  });
};

// 重置裁切框位置与大小
const resetCrop = () => {
  cropper?.reset();
};

// 确认裁切：hook 内部压缩并写入结果，组件负责销毁裁切器
const handleConfirmCrop = async () => {
  if (!cropper) return;
  try {
    await confirmCrop(cropper);
  } catch (err) {
    console.error("图片裁切压缩失败:", err);
  } finally {
    cropper?.destroy();
    cropper = null;
  }
};

// 取消裁切：关闭弹窗并销毁裁切器
const handleCancelCrop = () => {
  closeCrop();
  cropper?.destroy();
  cropper = null;
};

// 清空图片值
const removeImage = () => {
  image.value = "";
};
</script>

<template>
  <!-- 固定整体高度，保证上传前后表单区域不跳动 -->
  <div class="flex flex-col" :style="{ minHeight: `${height}px` }">
    <div class="flex gap-1">
      <!-- 始终保留上传入口：未上传展示占位，已上传时点击图片可重新上传替换 -->
      <div
        class="border-sf-border group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed text-sf-text-3 transition-colors hover:border-sf-theme hover:text-sf-theme"
        :style="{ width: `${DEFAULT_WIDTH}px`, height: `${DEFAULT_HEIGHT}px` }"
        :title="image ? '点击重新上传' : '上传图片'"
        @click="openPicker"
      >
        <img
          v-if="image"
          :src="toAvatarSrc(image)"
          alt="图片"
          class="h-full w-full shrink-0 object-cover"
        />
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

      <!-- 右侧垂直操作栏：图标加文字描述，参考 image 项目操作栏布局 -->
      <div v-if="image" class="flex h-full flex-col gap-1">
        <div
          class="flex cursor-pointer items-center gap-1 rounded-md px-1 py-1 transition-colors hover:text-sf-theme"
          title="删除图片"
          @click="removeImage"
        >
          <SfIcon icon="ic:round-delete" size="5" />
          <span class="text-xs">删除</span>
        </div>
        <div
          class="flex cursor-pointer items-center gap-1 rounded-md px-1 py-1 transition-colors hover:text-sf-theme"
          title="重新上传"
          @click="openPicker"
        >
          <SfIcon icon="ic:round-file-upload" size="5" />
          <span class="text-xs">重新上传</span>
        </div>
        <div
          class="flex cursor-pointer items-center gap-1 rounded-md px-1 py-1 transition-colors hover:text-sf-theme"
          @click="previewVisible = true"
        >
          <SfIcon icon="ic:round-zoom-in" size="5" />
          <span class="text-xs">查看图片</span>
        </div>
      </div>
    </div>
    <div class="flex cursor-pointer items-center gap-1 text-[11px] text-sf-text-2">
      该功能由
      <span @click="goImageTools" class="hover:text-sf-theme">{{ $t("router.image") }}</span>
      提供技术支持
    </div>
    <!-- 图片查看器：点击查看上传的大图 -->
    <el-image-viewer
      v-if="previewVisible"
      :url-list="[toAvatarSrc(image)]"
      @close="previewVisible = false"
    />

    <!-- 裁切弹窗：上传后先按组件宽高比裁切，确认后再压缩 -->
    <SfModal v-model="cropVisible" title="裁剪图片" width="720px">
      <!-- 裁剪区域：最大化利用空间 -->
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
      <!-- 底部操作栏 -->
      <footer class="mt-4 flex justify-end gap-3">
        <el-button @click="resetCrop">重置</el-button>
        <el-button @click="handleCancelCrop">取消</el-button>
        <el-button type="primary" @click="handleConfirmCrop">确认</el-button>
      </footer>
    </SfModal>
  </div>
</template>

<style lang="scss" scoped>
/* 裁切器可视区域高度 */
.cropper-box {
  height: 480px;
}
</style>
