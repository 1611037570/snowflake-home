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
  <div class="flex items-center gap-3">
    <Upload
      v-if="!image"
      :auto-upload="false"
      :show-file-list="false"
      accept="image/*"
      @change="handleChange"
    >
      <div
        class="border-sf-border flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border border-dashed text-sf-text-3 transition-colors hover:border-sf-theme hover:text-sf-theme"
        title="上传头像"
      >
        <SfIcon icon="mdi:image-plus" size="6" />
      </div>
    </Upload>

    <template v-else>
      <img :src="image" alt="头像" class="h-24 w-24 rounded-lg object-cover" />
      <SfIcon
        icon="ic:round-delete"
        size="4"
        boxSize="8"
        class="cursor-pointer rounded-lg transition-colors hover:text-sf-theme"
        title="删除头像"
        @click="removeImage"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
