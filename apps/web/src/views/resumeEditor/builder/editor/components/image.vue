<script setup>
import { useImageUpload } from "@/hooks";
import { toAvatarSrc } from "@/utils";
import { RESUME_WIDTH } from "@/views/resumeEditor/preview/constants";

// 图片作品字段：name 名称、img 图片、desc 描述、size 显示大小百分比
const name = defineModel("name", {
  type: String,
  default: "",
});
const img = defineModel("img", {
  type: String,
  default: "",
});
const desc = defineModel("desc", {
  type: String,
  default: "",
});
const size = defineModel("size", {
  type: Number,
  default: 50,
});

// 图片上传 hook：不裁切，保持原比例压缩为 WebP 裸 base64
const { openPicker, loading } = useImageUpload({
  crop: false,
  maxWidth: RESUME_WIDTH,
  onResult: (base64) => {
    img.value = base64;
  },
});
</script>

<template>
  <div class="flex w-full flex-col gap-1">
    <!-- 名称与描述 -->
    <div class="flex items-center">
      <div class="w-[100px] min-w-0">
        <SfInput v-model="name" placeholder="图片名称" />
      </div>
      <div class="min-w-0 flex-1">
        <SfInput v-model="desc" placeholder="图片描述" />
      </div>
    </div>
    <!-- 图片与大小控制：左右布局，编辑器内图片固定宽度不随滑杆变化 -->
    <div class="flex items-center gap-3">
      <!-- 图片预览或上传入口：固定宽度 -->
      <div
        class="group border-sf-border relative flex w-32 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed text-sf-text-3 transition-colors hover:border-sf-theme hover:text-sf-theme"
        :title="img ? '点击重新上传' : '上传图片'"
        @click="openPicker"
      >
        <img v-if="img" :src="toAvatarSrc(img)" alt="图片" class="h-auto w-full object-cover" />
        <!-- 已上传时鼠标悬停显示"重新上传"遮罩提示 -->
        <div
          v-if="img"
          class="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          重新上传
        </div>
        <div v-else class="flex h-24 w-full flex-col items-center justify-center gap-1">
          <SfIcon v-if="loading" icon="line-md:loading-twotone-loop" size="6" />
          <SfIcon v-else icon="mdi:image-plus" size="6" />
          <span class="text-xs">{{ loading ? "处理中" : "上传图片" }}</span>
        </div>
      </div>
      <!-- 显示大小：百分比滑杆控制，不用输入框 -->
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <SfSlider v-model="size" :min="25" :max="100" :step="5" class="flex-1" size="small" />
        <span class="w-12 shrink-0 text-right text-sm">{{ size }}%</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
