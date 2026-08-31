<template>
  <div class="flex h-full w-full flex-col">
    <div class="cropper-container" />
    <!-- 裁切比例操作按钮 -->
    <div class="mt-3 flex items-center gap-3">
      <ElButton :type="isFixed ? 'primary' : 'default'" class="flex-1" @click="toggleFixed">
        固定
      </ElButton>
      <ElButton :type="showCustom ? 'primary' : 'default'" class="flex-1" @click="toggleCustom">
        自定义比例
      </ElButton>
    </div>
    <!-- 自定义比例输入面板 -->
    <div v-if="showCustom" class="mt-3 flex items-center gap-2">
      <SfInput v-model="ratioW" placeholder="宽度" />
      <span class="text-sf-text-2">:</span>
      <SfInput v-model="ratioH" placeholder="高度" />
      <ElButton type="primary" @click="applyCustomRatio">应用</ElButton>
    </div>
  </div>
</template>

<script setup>
import Cropper from "cropperjs";
import { onBeforeUnmount, onMounted, ref } from "vue";

// 定义props接收图片地址
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});

// cropper 实例
let cropper = null;
// 是否固定当前裁切比例
const isFixed = ref(false);
// 是否展示自定义比例输入
const showCustom = ref(false);
// 自定义比例宽高输入
const ratioW = ref("");
const ratioH = ref("");

onMounted(() => {
  const image = new Image();

  image.src = props.src;
  image.alt = "Picture";

  cropper = new Cropper(image, {
    container: ".cropper-container",
    viewMode: 1, // 限制裁切框不超过图片边界
  });

  console.log(cropper);

  // 监听裁切框变化与图片移动，限制裁切框不超出图片显示区域
  cropper.getCropperSelection()?.addEventListener("change", clampSelection);
  cropper.getCropperImage()?.addEventListener("transform", clampSelection);
});

// 是否已有待执行的约束任务
let clampPending = false;

// 延迟到本次变化提交后再约束，避免在 change 事件同步派发阶段回写造成循环
function clampSelection() {
  if (clampPending) return;
  clampPending = true;
  requestAnimationFrame(() => {
    clampSelectionNow();
    clampPending = false;
  });
}

// 限制裁切框不超出图片显示区域
function clampSelectionNow() {
  const selection = cropper?.getCropperSelection();
  const image = cropper?.getCropperImage();
  const canvas = cropper?.getCropperCanvas();
  if (!selection || !image || !canvas) return;
  const canvasRect = canvas.getBoundingClientRect();
  const imageRect = image.getBoundingClientRect();
  // 图片尚未加载完成时跳过
  if (!imageRect.width || !imageRect.height) return;
  // 图片在画布内的显示区域
  const imgLeft = imageRect.left - canvasRect.left;
  const imgTop = imageRect.top - canvasRect.top;
  const imgRight = imgLeft + imageRect.width;
  const imgBottom = imgTop + imageRect.height;
  const ratio = selection.aspectRatio;
  let x = Math.max(selection.x, imgLeft);
  let y = Math.max(selection.y, imgTop);
  let width = selection.width;
  let height = selection.height;
  let maxW = imgRight - x;
  let maxH = imgBottom - y;
  // 裁切框整体拖出图片区域时，拉回图片左上角
  if (maxW <= 0 || maxH <= 0) {
    x = imgLeft;
    y = imgTop;
    maxW = imgRight - imgLeft;
    maxH = imgBottom - imgTop;
  }
  if (ratio > 0) {
    // 锁定比例时，等比缩放到可用空间（只缩小不放大）
    const scale = Math.min(maxW / width, maxH / height, 1);
    width *= scale;
    height *= scale;
  } else {
    // 自由比例时，直接裁剪宽高上限
    width = Math.min(width, maxW);
    height = Math.min(height, maxH);
  }
  // 宽高与当前位置未变化时不重复设置
  if (
    x === selection.x &&
    y === selection.y &&
    width === selection.width &&
    height === selection.height
  ) {
    return;
  }
  selection.$change(x, y, width, height, ratio, true);
}

// 固定当前裁切框比例，再次点击解除固定
function toggleFixed() {
  const selection = cropper?.getCropperSelection();
  if (!selection) return;
  isFixed.value = !isFixed.value;
  if (isFixed.value) {
    // 锁定为当前裁切框的宽高比
    selection.aspectRatio = selection.width / selection.height;
  } else {
    // 解除比例锁定
    selection.aspectRatio = NaN;
  }
}

// 展示/收起自定义比例输入
function toggleCustom() {
  showCustom.value = !showCustom.value;
}

// 应用自定义比例
function applyCustomRatio() {
  const w = Number(ratioW.value);
  const h = Number(ratioH.value);
  if (!w || !h) return;
  const selection = cropper?.getCropperSelection();
  if (!selection) return;
  // 设置宽高比并进入固定状态
  selection.aspectRatio = w / h;
  isFixed.value = true;
  showCustom.value = false;
}

// 卸载时移除监听
onBeforeUnmount(() => {
  cropper?.getCropperSelection()?.removeEventListener("change", clampSelection);
  cropper?.getCropperImage()?.removeEventListener("transform", clampSelection);
});
</script>

<style lang="scss" scoped>
.cropper-container {
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  margin-top: 1rem;
  padding: 1.25rem 1.5rem;
  width: 100%;
  flex: 1;
  min-height: 0;

  :deep(cropper-canvas) {
    height: 460px;
  }
}
</style>
