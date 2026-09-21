<script setup>
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { ref, watch } from "vue";
import { useImageUpload } from "@/hooks";
import { routerNavigation } from "@/utils";

// 新窗口打开 image 工具页
const goImageTools = () => routerNavigation("/image");

// 编辑区头像保持紧凑显示，裁剪输出继续使用高分辨率提升预览与导出清晰度
const DISPLAY_WIDTH = 70;
const DISPLAY_HEIGHT = 98;

const props = defineProps({
  /** 裁剪输出宽度（px），默认使用显示尺寸的三倍 */
  width: {
    type: Number,
    default: 282,
  },
  /** 裁剪输出高度（px），默认使用显示尺寸的三倍 */
  height: {
    type: Number,
    default: 396,
  },
});

const image = defineModel("modelValue", {
  type: String,
  default: "",
});

// 图片查看器显隐
const previewVisible = ref(false);

// 图片上传全流程 hook：vueuse 选择文件，内部完成裁切压缩并返回完整图片 Data URL
const { openPicker, handleFile, cropVisible, cropSrc, confirmCrop, closeCrop } = useImageUpload({
  crop: true,
  outputWidth: props.width,
  outputHeight: props.height,
  quality: 1, // 使用最高质量导出，避免图片质量损失
  onResult: (base64) => {
    image.value = base64;
  },
});

// 上传弹窗显隐：点击头像先打开弹窗，再从弹窗选择或拖入图片
const uploadVisible = ref(false);
// 弹窗内的拖拽上传区域
const dropZoneRef = ref();
const { isOverDropZone } = useDropZone(dropZoneRef, {
  dataTypes: ["Files"], // 只接受文件类型
  onDrop: (files) => {
    if (!files || !files.length) return;
    uploadVisible.value = false;
    handleFile(files[0]);
  },
});

// 从弹窗选择图片：先关闭弹窗，避免与裁剪弹窗叠加
const pickFromModal = () => {
  uploadVisible.value = false;
  openPicker();
};

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
  <div class="flex flex-col" :style="{ minHeight: `${DISPLAY_HEIGHT}px` }">
    <div class="flex gap-1">
      <!-- 始终保留上传入口：未上传展示占位，已上传时点击图片进入上传弹窗 -->
      <div
        class="border-sf-border group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed text-sf-text-3 transition-colors hover:border-sf-theme hover:text-sf-theme"
        :style="{ width: `${DISPLAY_WIDTH}px`, height: `${DISPLAY_HEIGHT}px` }"
        :title="image ? '更换头像' : '上传头像'"
        @click="uploadVisible = true"
      >
        <img
          v-if="image"
          :src="image"
          alt="图片"
          class="h-full w-full shrink-0 object-cover"
        />
        <!-- 已上传时鼠标悬停显示"更换头像"遮罩提示 -->
        <div
          v-if="image"
          class="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          更换头像
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
      :url-list="[image]"
      @close="previewVisible = false"
    />

    <!-- 上传弹窗：点击头像先进入弹窗，再从弹窗选择或拖入图片 -->
    <SfModal v-model="uploadVisible" title="上传头像" width="400px">
      <div
        ref="dropZoneRef"
        class="border-sf-border flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-sf-primary px-6 py-9 text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
        :class="{ 'border-sf-theme text-sf-theme': isOverDropZone }"
        @click="pickFromModal"
      >
        <SfIcon icon="mdi:image-plus" size="8" />
        <span class="text-sm">点击选择图片，或将图片拖到此处</span>
        <span class="text-xs text-sf-text-3">支持 JPG、PNG 等常见图片格式</span>
      </div>
      <!-- 上传建议默认收起，避免干扰用户选择图片 -->
      <SfCollapse :border="false" class="mt-3 rounded-xl bg-sf-bg px-3">
        <SfCollapseItem name="avatar-need">
          <template #title>
            <div class="flex items-center gap-3 text-sm text-sf-text-2">
              <SfIcon icon="mdi:help-circle-outline" size="4" />
              <span>简历是否需要放照片？</span>
            </div>
          </template>
          <div class="flex flex-col gap-3 pb-3 text-xs leading-6 text-sf-text-2">
            <p>是否放照片：民企、国企和中文简历一般建议放；外企和英文简历通常可不放。</p>
            <p>如果决定放照片，请使用证件照或职业照，避免使用生活照。</p>
          </div>
        </SfCollapseItem>
        <SfCollapseItem name="avatar-tips">
          <template #title>
            <div class="flex items-center gap-3 text-sm text-sf-text-2">
              <SfIcon icon="mdi:lightbulb-outline" size="4" />
              <span>照片拍摄建议</span>
            </div>
          </template>
          <div class="flex flex-col gap-3 pb-3 text-xs leading-6 text-sf-text-2">
            <p>裁剪：头顶留少量空间，露出肩部，避免只拍大头照。</p>
            <p>底色：推荐白色、蓝色或灰色，红色背景一般不建议。</p>
            <p>形象：自然微笑，头发整洁，尽量不要遮挡面部。</p>
            <p>着装：金融等正式行业可穿西装；互联网行业可选深色衬衫或 T 恤。</p>
            <p class="text-sf-text-3">图片会按当前头像框比例裁剪并压缩，仅用于简历头像展示。</p>
          </div>
        </SfCollapseItem>
      </SfCollapse>
    </SfModal>

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
