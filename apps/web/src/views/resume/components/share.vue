<script setup>
import { computed, nextTick, ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { useCopy } from "@/hooks";
import { useRouter } from "vue-router";

const router = useRouter();
const resumeStore = useResumeStore();
const { currentItem } = storeToRefs(resumeStore);
const visible = ref(false);
const qrCodeRef = ref();

// 分享地址使用简历页面，并携带当前简历标识，不暴露编辑器路径
const resumeUrl = computed(() => {
  const href = router.resolve({
    path: "/resume",
    query: currentItem.value?.id ? { id: currentItem.value.id } : undefined,
  }).href;
  return new URL(href, window.location.origin).href;
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
  <!-- 默认露出图标，悬停时整体滑出分享文案 -->
  <div
    class="flex-c fixed -right-30 bottom-6 z-50 cursor-pointer rounded-l-3xl bg-sf-theme p-3 text-sf-theme-text transition-all duration-300 hover:-translate-x-28"
    @click="visible = true"
  >
    <SfIcon icon="ph:paper-plane-right-fill" size="5" />
    <span class="pr-6 pl-3 text-sm whitespace-nowrap">分享轻舟简历</span>
  </div>

  <SfModal v-model="visible" title="分享简历">
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
