<script setup>
import { useImageUpload } from "@/hooks";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useResumeStore } from "@/stores";
import { DEFAULT_SCHOOL_LOGO_APPEARANCE, SCHOOL_LOGO_PRESET_WIDTHS } from "@/domain/resume/theme/schoolLogo";
import ImageCropModal from "./imageCropModal.vue";

// 校徽独立保存，仅在确认裁切后写回图片。
const image = defineModel("modelValue", {
  type: String, // 校徽图片地址。
  default: "", // 未上传时不显示校徽。
});
const cropRatio = ref("1:1");
const resumeStore = useResumeStore();
const cropAspectRatio = computed(() => cropRatio.value === "3:1" ? 3 : 1);
const { openPicker, loading, cropVisible, cropSrc, confirmCrop, closeCrop } = useImageUpload({
  crop: true, // 上传后使用与头像相同的裁切流程。
  quality: 1, // 保留校徽细节。
  onResult: (dataUrl) => { image.value = dataUrl; }, // 写回校徽图片。
});
// 再次上传时默认选中此前确认的裁切比例，取消裁切不改写配置。
watch(cropVisible, (visible) => {
  if (visible) cropRatio.value = resumeStore.currentUI?.user?.logo?.ratio ?? DEFAULT_SCHOOL_LOGO_APPEARANCE.ratio;
});
// 按所选比例输出，校徽设置不修改头像的比例或外观。
const handleConfirmCrop = async (cropper) => {
  if (!cropper) return;
  const ratio = cropRatio.value;
  try {
    await confirmCrop(cropper, {
      width: 800, // 校徽裁切输出宽度。
      height: Math.round(800 / (ratio === "3:1" ? 3 : 1)), // 按本次确认的裁切比例计算输出高度。
    });
    if (resumeStore.currentUI) {
      resumeStore.currentUI.user.logo = {
        ...DEFAULT_SCHOOL_LOGO_APPEARANCE,
        ...resumeStore.currentUI.user.logo,
        width: SCHOOL_LOGO_PRESET_WIDTHS[ratio], // 确认上传时按正方形或横版应用对应默认尺寸。
        ratio, // 保存本次确认的裁切比例，展示时保持一致。
      };
    }
  } catch (error) {
    console.error("校徽裁切压缩失败:", error);
  }
};
onBeforeUnmount(closeCrop);
</script>

<template>
  <!-- 图片删除统一交给标题行右侧，此处保留上传操作。 -->
  <div class="flex w-full items-start gap-3">
    <button
      type="button"
      class="group relative flex h-[70px] w-[70px] shrink-0 cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border border-dashed border-sf-b text-sf-text-3 transition-colors hover:border-sf-theme disabled:cursor-wait"
      :disabled="loading"
      :aria-label="$t('uploadSchoolLogo')"
      @click="openPicker"
    >
      <img v-if="image" :src="image" :alt="$t('schoolLogo')" class="h-full w-full object-contain" />
      <template v-else>
        <SfIcon icon="mdi:image-plus" size="6" />
        <span class="text-xs">{{ loading ? $t("processing") : $t("uploadSchoolLogo") }}</span>
      </template>
    </button>
    <div v-if="image" class="flex flex-col items-start gap-3">
      <button
        type="button"
        class="flex cursor-pointer items-center gap-3 rounded-md text-xs text-sf-text transition-colors hover:text-sf-theme disabled:cursor-wait"
        :disabled="loading"
        @click="openPicker"
      >
        <SfIcon icon="ic:round-file-upload" size="5" />
        <span>{{ loading ? $t("processing") : $t("reuploadImage") }}</span>
      </button>
    </div>
  </div>
  <ImageCropModal
    :model-value="cropVisible"
    :src="cropSrc"
    :aspect-ratio="cropAspectRatio"
    @update:model-value="closeCrop"
    @confirm="handleConfirmCrop"
  >
    <div class="mt-3 grid grid-cols-2 gap-3">
      <SfButton size="small" border :type="cropRatio === '1:1' ? 'theme' : 'bg'" @click="cropRatio = '1:1'">
        {{ $t("schoolLogoSquareRatio") }}
      </SfButton>
      <SfButton size="small" border :type="cropRatio === '3:1' ? 'theme' : 'bg'" @click="cropRatio = '3:1'">
        {{ $t("schoolLogoWideRatio") }}
      </SfButton>
    </div>
  </ImageCropModal>
</template>
