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
import "cropperjs/dist/cropper.css";

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

  // viewMode 2 限制裁切框不超出图片边界
  cropper = new Cropper(image, {
    container: ".cropper-container",
    viewMode: 2,
  });
});

// 固定当前裁切框比例，再次点击解除固定
function toggleFixed() {
  if (!cropper) return;
  isFixed.value = !isFixed.value;
  if (isFixed.value) {
    // 锁定为当前裁切框的宽高比
    const data = cropper.getData();
    cropper.setAspectRatio(data.width / data.height);
  } else {
    // 解除比例锁定
    cropper.setAspectRatio(NaN);
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
  // 设置宽高比并进入固定状态
  cropper?.setAspectRatio(w / h);
  isFixed.value = true;
  showCustom.value = false;
}

// 卸载时移除监听
onBeforeUnmount(() => {
  cropper?.destroy();
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
  height: 460px;
  overflow: hidden;
}
</style>
