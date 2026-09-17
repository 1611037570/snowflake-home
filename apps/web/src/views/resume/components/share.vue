<script setup>
import { computed, nextTick, ref } from "vue";
import { useCopy } from "@/hooks";

const visible = ref(false);
const qrCodeRef = ref();

// 分享地址使用简历页面，并携带当前简历标识，不暴露编辑器路径
const resumeUrl = computed(() => {
  return new URL("http://qzresume.com", window.location.origin).href;
});

// 复制当前简历的公开地址
const copyLink = () => {
  useCopy(resumeUrl.value);
};

// 将二维码组件生成的图片保存到本地
const saveQrCode = async () => {
  await nextTick();
  const dataUrl = qrCodeRef.value?.getDataUrl?.();
  if (!dataUrl) return;
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "简历分享二维码.png";
  link.click();
};
</script>

<template>
  <!-- 分享入口位于问题反馈上方，并保留 12px 间距 -->
  <div
    class="flex-c fixed -right-30 bottom-20 z-50 cursor-pointer rounded-l-3xl bg-sf-theme p-3 text-sf-theme-text transition-all duration-300 hover:-translate-x-28"
    @click="visible = true"
  >
    <SfIcon icon="ph:paper-plane-right-fill" size="5" />
    <span class="pr-6 pl-3 text-sm whitespace-nowrap">分享{{ $t("router.resume") }}</span>
  </div>

  <SfModal v-model="visible" title="分享轻舟简历">
    <div class="flex w-[360px] max-w-[80vw] flex-col items-center gap-3">
      <div class="h-56 w-56 rounded-3xl bg-white p-3">
        <SfQrcode ref="qrCodeRef" :value="resumeUrl" :size="220" />
      </div>
      <p class="max-w-full text-center text-sm break-all text-sf-text-2">{{ resumeUrl }}</p>
      <div class="flex w-full gap-3">
        <SfButton class="flex-1" type="bg" @click="saveQrCode">保存图片</SfButton>
        <SfButton class="flex-1" @click="copyLink">复制链接</SfButton>
      </div>
    </div>
  </SfModal>
</template>
