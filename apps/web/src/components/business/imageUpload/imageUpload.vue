<script setup>
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { ref } from "vue";
import Upload from "@/components/el/upload";
import { compressWebp } from "./compressWebp";

// 默认 1 寸照尺寸：25mm x 35mm @96dpi ≈ 96 x 132px
const DEFAULT_WIDTH = 72;
const DEFAULT_HEIGHT = 98;

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

// 图片查看器显隐
const previewVisible = ref(false);

// ===== 裁切弹窗状态 =====
const cropVisible = ref(false);
const cropSrc = ref("");
const cropImgRef = ref(null);
let cropper = null;

// 裁剪比例选项：默认按组件宽高比，其余为常用比例，自由比例不锁定
const ratioList = [
  { label: "默认", value: props.width / props.height },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "3:4", value: 3 / 4 },
  { label: "自由", value: NaN },
];
// 当前选中比例（按 label 判断，避免 NaN 比较失效）
const activeRatio = ref("默认");

// 切换裁剪比例
const setRatio = (label) => {
  activeRatio.value = label;
  cropper?.setAspectRatio(ratioList.find((item) => item.label === label)?.value);
};

// 选择文件：暂存图片并打开裁切弹窗，先按组件宽高比裁切
const handleChange = (uploadFile) => {
  const rawFile = uploadFile?.raw;
  if (!rawFile) return;
  // 选中图片打印一次（统一按 base64 字符长度）
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = String(reader.result);
    console.log("图片大小-选中", {
      字符长度: dataUrl.length,
      KB: (dataUrl.length / 1024).toFixed(1),
    });
  };
  reader.readAsDataURL(rawFile);
  cropSrc.value = URL.createObjectURL(rawFile);
  cropVisible.value = true;
};

// 图片加载完成后初始化裁切器，裁切框锁定为组件宽高比
const initCropper = () => {
  if (cropper) cropper.destroy();
  cropper = new Cropper(cropImgRef.value, {
    aspectRatio: ratioList.find((item) => item.label === activeRatio.value)?.value,
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

// 确认裁切：取裁切区域 canvas，再压缩到目标尺寸
const confirmCrop = async () => {
  if (!cropper) return;
  try {
    const canvas = cropper.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    });

    // 缩小目标尺寸再乘 0.9，压缩质量 0.92
    const { src } = await compressWebp(canvas, props.width * 0.8, props.height * 0.8, 0.8);
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
    <el-button v-if="image" size="small" @click="previewVisible = true">查看图片</el-button>

    <!-- 图片查看器：点击查看上传的大图 -->
    <el-image-viewer v-if="previewVisible" :url-list="[image]" @close="previewVisible = false" />

    <!-- 裁切弹窗：上传后先按组件宽高比裁切，确认后再压缩 -->
    <SfModal v-model="cropVisible" title="裁剪图片" width="720px">
      <!-- 裁剪比例切换 -->
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <span class="text-sm text-sf-text-2">裁剪比例：</span>
        <button
          v-for="ratio in ratioList"
          :key="ratio.label"
          type="button"
          class="rounded-md border px-3 py-1.5 text-sm transition-colors"
          :class="
            activeRatio === ratio.label
              ? 'border-sf-theme bg-sf-theme text-sf-base'
              : 'border-sf-b text-sf-text hover:border-sf-theme'
          "
          @click="setRatio(ratio.label)"
        >
          {{ ratio.label }}
        </button>
      </div>
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
        <el-button @click="closeCrop">取消</el-button>
        <el-button type="primary" @click="confirmCrop">确认</el-button>
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
