<script setup>
import { useImageUpload } from "@/hooks";

// 校徽独立保存，上传时保留原始比例，不使用头像裁剪设置。
const image = defineModel("modelValue", {
  type: String, // 校徽图片地址。
  default: "", // 未上传时不显示校徽。
});
const { openPicker, loading } = useImageUpload({
  crop: false, // 保留校徽完整图案。
  maxWidth: 800, // 限制图片宽度，控制存储体积。
  quality: 1, // 保留校徽细节。
  onResult: (dataUrl) => { image.value = dataUrl; }, // 写回校徽图片。
});
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
</template>
