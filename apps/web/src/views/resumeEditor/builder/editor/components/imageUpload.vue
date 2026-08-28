<script setup>
import Upload from "@/components/el/upload";

const image = defineModel("modelValue", {
  type: String,
  default: "",
});

// 将本地文件读取为完整 Base64，并写回表单值
const handleChange = (uploadFile) => {
  const rawFile = uploadFile?.raw;
  if (!rawFile) return;

  const reader = new FileReader();
  reader.onload = () => {
    const base64 = String(reader.result || "");
    image.value = base64;
    console.log("图片 Base64:", base64);
  };
  reader.readAsDataURL(rawFile);
};

// 清空头像值
const removeImage = () => {
  image.value = "";
};
</script>

<template>
  <!-- 固定整体高度，保证上传前后表单区域不跳动；1寸照尺寸约 96x132px -->
  <div class="flex h-33 shrink-0 items-center gap-3">
    <!-- 始终保留上传入口：未上传展示占位，已上传时点击图片可重新上传替换 -->
    <Upload :auto-upload="false" :show-file-list="false" accept="image/*" @change="handleChange">
      <div
        class="border-sf-border group relative flex h-33 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed text-sf-text-3 transition-colors hover:border-sf-theme hover:text-sf-theme"
        :title="image ? '点击重新上传头像' : '上传头像'"
      >
        <img v-if="image" :src="image" alt="头像" class="h-33 w-24 shrink-0 object-cover" />
        <!-- 已上传时鼠标悬停显示"重新上传"遮罩提示 -->
        <div
          v-if="image"
          class="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          重新上传
        </div>
        <div v-else class="flex h-full w-full flex-col items-center justify-center gap-1">
          <SfIcon icon="mdi:image-plus" size="6" />
          <span class="text-xs">上传头像</span>
        </div>
      </div>
    </Upload>

    <SfIcon
      v-if="image"
      icon="ic:round-delete"
      size="4"
      boxSize="8"
      class="cursor-pointer rounded-lg transition-colors hover:text-sf-theme"
      title="删除头像"
      @click="removeImage"
    />
  </div>
</template>

<style lang="scss" scoped></style>
