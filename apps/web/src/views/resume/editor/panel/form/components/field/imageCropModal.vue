<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { loadCropper } from "./cropperLoader";

const props = defineProps({
  src: { type: String, default: "" }, // 待裁切图片地址。
  aspectRatio: { type: Number, default: 1 }, // 当前裁切框的宽高比。
});
const visible = defineModel("modelValue", { type: Boolean, default: false }); // 裁切弹窗显隐。
const emit = defineEmits(["confirm"]); // 确认时交由上传字段压缩并保存图片。
const imageRef = ref(null);
const cropperReady = ref(false);
let cropper = null;
let cropVersion = 0;
// 图片地址与弹窗实例共同确定本次裁切任务。
const imageKey = computed(() => visible.value ? props.src : "");
const destroyCropper = () => {
  cropVersion++;
  cropperReady.value = false;
  cropper?.destroy();
  cropper = null;
};
watch(imageKey, (src) => {
  destroyCropper();
  if (src) void loadCropper().catch(() => {});
}, { flush: "sync" });
onBeforeUnmount(destroyCropper);

// 头像与校徽共用裁切器创建、异步失效和资源释放逻辑。
const initCropper = async () => {
  const version = ++cropVersion;
  const imageElement = imageRef.value;
  cropperReady.value = false;
  let Cropper;
  try {
    Cropper = await loadCropper();
  } catch (error) {
    if (version === cropVersion && visible.value) ElMessage.error("裁剪组件加载失败，请重新选择图片");
    return;
  }
  if (version !== cropVersion || !visible.value || imageRef.value !== imageElement || !imageElement) return;
  cropper?.destroy();
  cropper = new Cropper(imageElement, {
    aspectRatio: props.aspectRatio, // 按当前字段选择的比例裁切。
    viewMode: 2, // 裁切区域保持在图片范围内。
    guides: true, // 显示裁切参考线。
    center: true, // 显示中心标记。
    autoCropArea: 0.8, // 默认裁切区域占图片的比例。
    movable: true, // 允许移动图片。
    zoomable: true, // 允许缩放图片。
    cropBoxMovable: true, // 允许移动裁切框。
    cropBoxResizable: true, // 允许调整裁切框大小。
    background: true, // 透明区域显示棋盘格。
  });
  cropperReady.value = true;
};
// 比例控件由字段提供，共用弹窗负责更新裁切框。
watch(() => props.aspectRatio, (ratio) => cropper?.setAspectRatio(ratio));
</script>

<template>
  <SfModal v-model="visible" :title="$t('cropImage')" width="720px">
    <div class="flex h-[480px] w-full items-center justify-center overflow-hidden rounded-3xl bg-sf-bg">
      <img
        v-if="visible && src"
        :key="src"
        ref="imageRef"
        :src="src"
        :alt="$t('cropImageAlt')"
        class="max-w-full"
        @load="initCropper"
      />
    </div>
    <slot />
    <footer class="mt-3 flex justify-end gap-3">
      <el-button :disabled="!cropperReady" @click="cropper?.reset()">{{ $t("resetCrop") }}</el-button>
      <el-button @click="visible = false">{{ $t("cancel") }}</el-button>
      <el-button type="primary" :disabled="!cropperReady" @click="emit('confirm', cropper)">{{ $t("confirmAction") }}</el-button>
    </footer>
  </SfModal>
</template>
