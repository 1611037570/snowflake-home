<script setup>
import { loadCropper } from "./cropperLoader";
import { ElMessage } from "element-plus";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useImageUpload } from "@/hooks";
import { routerNavigation } from "@/utils";
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import {
  AVATAR_OUTPUT_SCALE,
  AVATAR_RADIUS_LIMITS,
  DEFAULT_AVATAR_APPEARANCE,
  DEFAULT_PORTRAIT_AVATAR_SIZE,
  resolveAvatarAspectRatio,
} from "@/domain/resume/theme/avatar";
import { resolveThemeDecisions } from "@/domain/resume/theme/themeDecisions";

// 新窗口打开 image 工具页
const goImageTools = () => routerNavigation("/image");

// 编辑区头像保持紧凑显示，裁剪输出继续使用高分辨率提升预览与导出清晰度
const DISPLAY_WIDTH = 70;

const props = defineProps({
  /** 裁剪输出宽度（px），默认使用显示尺寸的三倍 */
  width: {
    type: Number,
    default: DEFAULT_PORTRAIT_AVATAR_SIZE.width * AVATAR_OUTPUT_SCALE,
  },
  /** 裁剪输出高度（px），默认使用显示尺寸的三倍 */
  height: {
    type: Number,
    default: DEFAULT_PORTRAIT_AVATAR_SIZE.height * AVATAR_OUTPUT_SCALE,
  },
});

const image = defineModel("modelValue", {
  type: String,
  default: "",
});
const { currentUI } = storeToRefs(useResumeStore());
const avatarAppearance = computed(() => ({
  ...DEFAULT_AVATAR_APPEARANCE,
  ...(currentUI.value?.user?.avatar || {}),
}));
const themeAvatarSize = computed(() =>
  resolveThemeDecisions(currentUI.value?.theme?.template).avatarSize,
);
const themeCropRatio = computed(() =>
  themeAvatarSize.value.width === themeAvatarSize.value.height ? "1:1" : "5:7",
);
// 上传入口默认跟随主题声明的证件照或正方形比例
const displayRatio = computed(() =>
  avatarAppearance.value.ratio === "theme" && avatarAppearance.value.shape !== "circle"
    ? themeAvatarSize.value.width / themeAvatarSize.value.height
    : resolveAvatarAspectRatio(avatarAppearance.value),
);
const displayHeight = computed(() => Math.round(DISPLAY_WIDTH / displayRatio.value));
const displayRadius = computed(() => {
  const configuredRadius = Number(avatarAppearance.value.borderRadius);
  if (avatarAppearance.value.borderRadius !== null && Number.isFinite(configuredRadius)) {
    return `${Math.min(AVATAR_RADIUS_LIMITS.max, Math.max(AVATAR_RADIUS_LIMITS.min, configuredRadius))}%`;
  }
  if (avatarAppearance.value.shape === "square") return "0";
  if (avatarAppearance.value.shape === "rounded") return "0.75rem";
  if (avatarAppearance.value.shape === "circle") return "50%";
  return "1.5rem";
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
const cropperReady = ref(false);
const cropRatio = ref("5:7");
const cropCustomRatioWidth = ref(5);
const cropCustomRatioHeight = ref(7);
const cropUsesOneInchPreset = ref(false);
const cropRatioChanged = ref(false);
const cropAppearance = computed(() => ({
  ...avatarAppearance.value,
  ratio: cropRatio.value,
  customRatioWidth: cropCustomRatioWidth.value,
  customRatioHeight: cropCustomRatioHeight.value,
  shape:
    cropRatio.value === "1:1" && avatarAppearance.value.shape === "circle"
      ? "circle"
      : "square",
}));
const cropAspectRatio = computed(() =>
  !cropRatioChanged.value && avatarAppearance.value.ratio === "theme"
    ? themeAvatarSize.value.width / themeAvatarSize.value.height
    : resolveAvatarAspectRatio(cropAppearance.value),
);
let cropVersion = 0;
// 字段卸载时释放裁剪器，避免旧弹窗的监听与图片节点继续占用内存
onBeforeUnmount(() => {
  cropVersion++;
  cropper?.destroy();
  cropper = null;
});

// 弹窗关闭时同步销毁裁切器（含右上角关闭等场景）
watch(cropVisible, (visible) => {
  // 弹窗打开即开始加载，与图片解码并行；创建时统一处理加载失败。
  if (visible) {
    cropRatio.value =
      avatarAppearance.value.ratio === "theme"
        ? themeCropRatio.value
        : avatarAppearance.value.ratio;
    cropCustomRatioWidth.value = avatarAppearance.value.customRatioWidth;
    cropCustomRatioHeight.value = avatarAppearance.value.customRatioHeight;
    cropUsesOneInchPreset.value = false;
    cropRatioChanged.value = false;
    void loadCropper().catch(() => {});
  }
  if (!visible) {
    // 关闭时使仍在下载中的裁剪任务失效。
    cropVersion++;
    cropperReady.value = false;
    cropper?.destroy();
    cropper = null;
  }
});

// 图片加载完成后初始化裁切器，裁切框锁定为组件宽高比
const initCropper = async () => {
  const version = ++cropVersion;
  const imageElement = cropImgRef.value;
  cropperReady.value = false;
  let Cropper;
  try {
    Cropper = await loadCropper();
  } catch (error) {
    if (version === cropVersion && cropVisible.value) ElMessage.error("裁剪组件加载失败，请重新选择图片");
    return;
  }
  // 图片替换、关闭或卸载后不创建过期裁剪器。
  if (version !== cropVersion || !cropVisible.value || cropImgRef.value !== imageElement || !imageElement) return;
  if (cropper) cropper.destroy();
  cropper = new Cropper(imageElement, {
    // 裁剪框读取本次选择的头像比例，允许在弹窗内切换
    aspectRatio: cropAspectRatio.value,
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
  cropperReady.value = true;
};

// 重置裁切框位置与大小
const resetCrop = () => {
  cropper?.reset();
};

// 裁剪比例先保存在弹窗内，确认后才写入简历视觉配置
const applyCropRatio = (value) => {
  cropRatio.value = value;
  cropUsesOneInchPreset.value = false;
  cropRatioChanged.value = true;
  cropper?.setAspectRatio(cropAspectRatio.value);
};
const applyOneInchCrop = () => {
  cropRatio.value = "5:7";
  cropUsesOneInchPreset.value = true;
  cropRatioChanged.value = true;
  cropper?.setAspectRatio(cropAspectRatio.value);
};
const applyCustomCropRatio = () => {
  cropUsesOneInchPreset.value = false;
  cropRatioChanged.value = true;
  cropper?.setAspectRatio(cropAspectRatio.value);
};

// 确认裁切：hook 内部压缩并写入结果，组件负责销毁裁切器
const handleConfirmCrop = async () => {
  if (!cropper) return;
  try {
    const ratio = cropAspectRatio.value;
    const outputHeight = Math.max(1, Math.round(props.width / ratio));
    // 默认输出按头像宽度生成三倍清晰图，过高比例仍受既有高度上限约束
    const outputSize = outputHeight <= props.height
      ? { width: props.width, height: outputHeight }
      : { width: Math.max(1, Math.round(props.height * ratio)), height: props.height };
    await confirmCrop(cropper, outputSize);
    if (currentUI.value) {
      currentUI.value.user.avatar = {
        ...avatarAppearance.value,
        ratio: cropRatioChanged.value ? cropRatio.value : avatarAppearance.value.ratio,
        customRatioWidth: cropCustomRatioWidth.value,
        customRatioHeight: cropCustomRatioHeight.value,
        ...(cropUsesOneInchPreset.value
          ? { shape: "square", width: DEFAULT_PORTRAIT_AVATAR_SIZE.width }
          : {}),
      };
    }
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
  <div class="flex flex-col" :style="{ minHeight: `${displayHeight}px` }">
    <div class="flex gap-1">
      <!-- 始终保留上传入口：未上传展示占位，已上传时点击图片进入上传弹窗 -->
      <div
        class="border-sf-border group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-dashed text-sf-text-3 transition-colors hover:border-sf-theme hover:text-sf-theme"
        :style="{
          width: `${DISPLAY_WIDTH}px`,
          height: `${displayHeight}px`,
          borderRadius: displayRadius,
        }"
        @click="uploadVisible = true"
      >
        <img v-if="image" :src="image" :alt="$t('uploadAvatarImage')" class="h-full w-full shrink-0 object-cover" />
        <!-- 已上传时鼠标悬停显示"更换头像"遮罩提示 -->
        <div
          v-if="image"
          class="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          {{ $t("changeAvatar") }}
        </div>
        <div v-else class="flex h-full w-full flex-col items-center justify-center gap-1">
          <SfIcon icon="mdi:image-plus" size="6" />
          <span class="text-xs">{{ $t("uploadAvatarImage") }}</span>
        </div>
      </div>

      <!-- 右侧垂直操作栏：图标加文字描述，参考 image 项目操作栏布局 -->
      <div v-if="image" class="flex h-full flex-col gap-1">
        <div
          class="flex cursor-pointer items-center gap-1 rounded-md px-1 py-1 transition-colors hover:text-sf-error"
          @click="removeImage"
        >
          <!-- 头像删除入口仅在悬停时显示危险色。 -->
          <SfIcon icon="ic:round-delete" size="5" />
          <span class="text-xs">{{ $t("delete") }}</span>
        </div>
        <div
          class="flex cursor-pointer items-center gap-1 rounded-md px-1 py-1 transition-colors hover:text-sf-theme"
          @click="openPicker"
        >
          <SfIcon icon="ic:round-file-upload" size="5" />
          <span class="text-xs">{{ $t("reuploadImage") }}</span>
        </div>
        <div
          class="flex cursor-pointer items-center gap-1 rounded-md px-1 py-1 transition-colors hover:text-sf-theme"
          @click="previewVisible = true"
        >
          <SfIcon icon="ic:round-zoom-in" size="5" />
          <span class="text-xs">{{ $t("viewImage") }}</span>
        </div>
      </div>
    </div>
    <div class="flex cursor-pointer items-center gap-1 text-[11px] text-sf-text-2">
      {{ $t("providedBy") }}
      <span @click="goImageTools" class="hover:text-sf-theme">{{ $t("core.router.image") }}</span>
      {{ $t("techSupport") }}
    </div>
    <!-- 图片查看器：点击查看上传的大图 -->
    <el-image-viewer v-if="previewVisible" :url-list="[image]" @close="previewVisible = false" />

    <!-- 上传弹窗：点击头像先进入弹窗，再从弹窗选择或拖入图片 -->
    <SfModal v-model="uploadVisible" :title="$t('uploadAvatar')" width="400px">
      <div
        ref="dropZoneRef"
        class="border-sf-border flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed bg-sf-primary px-6 py-9 text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
        :class="{ 'border-sf-theme text-sf-theme': isOverDropZone }"
        @click="pickFromModal"
      >
        <SfIcon icon="mdi:image-plus" size="8" />
        <span class="text-sm">{{ $t("chooseOrDropImage") }}</span>
        <span class="text-xs text-sf-text-3">{{ $t("imageFormatSupport") }}</span>
      </div>
      <!-- 上传建议默认收起，避免干扰用户选择图片 -->
      <SfCollapse :border="true" class="mt-3 rounded-3xl bg-sf-bg px-3">
        <SfCollapseItem name="avatar-need">
          <template #title>
            <div class="flex items-center gap-3 text-sm text-sf-text-2">
              <SfIcon icon="mdi:help-circle-outline" size="4" />
              <span>{{ $t("resumePhotoQuestion") }}</span>
            </div>
          </template>
          <div class="flex flex-col gap-3 text-xs leading-6 text-sf-text-2">
            <p>{{ $t("photoUsageTip") }}</p>
            <p>{{ $t("photoUsageAdvice") }}</p>
          </div>
        </SfCollapseItem>
        <SfCollapseItem name="avatar-print">
          <template #title>
            <div class="flex items-center gap-3 text-sm text-sf-text-2">
              <SfIcon icon="mdi:printer-outline" size="4" />
              <span>{{ $t("photoPrintQuestion") }}</span>
            </div>
          </template>
          <div class="flex flex-col gap-3 text-xs leading-6 text-sf-text-2">
            <p>{{ $t("photoPrintColorAdvice") }}</p>
            <p>{{ $t("photoPrintGrayAdvice") }}</p>
          </div>
        </SfCollapseItem>
        <SfCollapseItem name="avatar-tips">
          <template #title>
            <div class="flex items-center gap-3 text-sm text-sf-text-2">
              <SfIcon icon="mdi:lightbulb-outline" size="4" />
              <span>{{ $t("photoAdvice") }}</span>
            </div>
          </template>
          <div class="flex flex-col gap-3 text-xs leading-6 text-sf-text-2">
            <p>{{ $t("photoCropAdvice") }}</p>
            <p>{{ $t("photoBackgroundAdvice") }}</p>
            <p>{{ $t("photoAppearanceAdvice") }}</p>
            <p>{{ $t("photoClothingAdvice") }}</p>
            <p class="text-sf-text-3">{{ $t("photoProcessingTip") }}</p>
          </div>
        </SfCollapseItem>
      </SfCollapse>
    </SfModal>

    <!-- 裁切弹窗：上传后先按组件宽高比裁切，确认后再压缩 -->
    <SfModal v-model="cropVisible" :title="$t('cropImage')" width="720px">
      <!-- 裁剪区域：最大化利用空间 -->
      <div
        class="cropper-box flex w-full items-center justify-center overflow-hidden rounded-3xl bg-sf-bg"
      >
        <img
          v-if="cropSrc"
          ref="cropImgRef"
          :src="cropSrc"
          :alt="$t('cropImageAlt')"
          class="max-w-full"
          @load="initCropper"
        />
      </div>
      <div class="mt-3 flex flex-col gap-3">
        <div class="flex flex-col gap-3">
          <span class="text-sm text-sf-text-2">{{ $t("avatarRatio") }}</span>
          <div class="grid grid-cols-3 gap-3">
            <SfButton
              size="small"
              border
              :type="cropUsesOneInchPreset ? 'theme' : 'bg'"
              @click="applyOneInchCrop"
            >{{ $t("oneInchPhoto") }}</SfButton>
            <SfButton
              size="small"
              border
              :type="!cropUsesOneInchPreset && cropRatio === '1:1' ? 'theme' : 'bg'"
              @click="applyCropRatio('1:1')"
            >1:1</SfButton>
            <SfButton
              size="small"
              border
              :type="!cropUsesOneInchPreset && cropRatio === '4:3' ? 'theme' : 'bg'"
              @click="applyCropRatio('4:3')"
            >4:3</SfButton>
            <SfButton
              size="small"
              border
              :type="!cropUsesOneInchPreset && cropRatio === '3:4' ? 'theme' : 'bg'"
              @click="applyCropRatio('3:4')"
            >3:4</SfButton>
            <SfButton
              size="small"
              border
              :type="!cropUsesOneInchPreset && cropRatio === '16:9' ? 'theme' : 'bg'"
              @click="applyCropRatio('16:9')"
            >16:9</SfButton>
            <SfButton
              size="small"
              border
              :type="cropRatio === 'custom' ? 'theme' : 'bg'"
              @click="applyCropRatio('custom')"
            >{{ $t("customRatio") }}</SfButton>
          </div>
          <div v-if="cropRatio === 'custom'" class="grid grid-cols-2 gap-3">
            <SfInputNumber
              v-model="cropCustomRatioWidth"
              :min="1"
              :max="20"
              @change="applyCustomCropRatio"
            />
            <SfInputNumber
              v-model="cropCustomRatioHeight"
              :min="1"
              :max="20"
              @change="applyCustomCropRatio"
            />
          </div>
        </div>
      </div>
      <!-- 底部操作栏 -->
      <footer class="mt-4 flex justify-end gap-3">
        <el-button :disabled="!cropperReady" @click="resetCrop">{{ $t("resetCrop") }}</el-button>
        <el-button @click="handleCancelCrop">{{ $t("cancel") }}</el-button>
        <el-button type="primary" :disabled="!cropperReady" @click="handleConfirmCrop">{{ $t("confirmAction") }}</el-button>
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
