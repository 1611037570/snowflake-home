<script setup>
import QRCode from "qrcode";
import { onMounted, ref, watch } from "vue";

defineOptions({ name: "SfQrcode" });

// 接收要生成二维码的数据
const props = defineProps({
  value: {
    type: String,
    default: "",
  },
  size: {
    type: Number,
    default: 256,
  },
});

// 二维码图片URL
const qrUrl = ref("");

// 生成二维码
const generateQRCode = async () => {
  if (!props.value) return;
  try {
    // 使用qrcode库生成二维码
    qrUrl.value = await QRCode.toDataURL(props.value, {
      width: props.size || 256, // 二维码尺寸（像素）
      margin: 1,
      errorCorrectionLevel: "H",
    });
  } catch (error) {
    console.error("生成二维码失败:", error);
  }
};

// 组件挂载时生成二维码
onMounted(() => {
  generateQRCode();
});

// 监听数据变化，重新生成二维码
watch(
  () => props.value,
  () => {
    generateQRCode();
  },
);

// 监听大小变化，重新生成二维码
watch(
  () => props.size,
  () => {
    generateQRCode();
  },
);
</script>

<template>
  <SfImg v-if="qrUrl" :src="qrUrl" :alt="'QR Code for ' + value" class="h-full w-full" />
</template>

<style lang="scss" scoped>
.qrcode-container {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.qrcode-container:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
</style>
