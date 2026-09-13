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
  <div class="group relative h-9 w-9 rounded-3xl">
    <div
      class="absolute top-0 right-0 flex h-9 w-9 items-center overflow-hidden rounded-none bg-sf-theme-2 text-sf-theme-text transition-all duration-300 group-hover:w-[72px]"
    >
      <span
        class="max-w-0 translate-x-2 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-300 group-hover:mr-9 group-hover:max-w-9 group-hover:translate-x-0 group-hover:opacity-100"
      >
        分享
      </span>
    </div>
    <button
      type="button"
      aria-label="分享"
      class="relative z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-3xl bg-sf-bg-2 text-sf-base transition-colors duration-300 hover:bg-sf-theme hover:text-sf-theme-text"
      @click="visible = true"
    >
      <SfIcon icon="fa6-solid:share-alt" size="5" />
    </button>
  </div>

  <SfModal v-model="visible" title="分享简历">
    <div class="flex w-[360px] max-w-[80vw] flex-col items-center gap-3">
      <div class="h-56 w-56 rounded-3xl bg-white p-3">
        <SfQrcode ref="qrCodeRef" :value="resumeUrl" :size="220" />
      </div>
      <p class="max-w-full break-all text-center text-sm text-sf-text-2">{{ resumeUrl }}</p>
      <div class="flex w-full gap-3">
        <SfButton class="flex-1" type="bg" @click="saveQrCode">保存图片</SfButton>
        <SfButton class="flex-1" @click="copyLink">复制链接</SfButton>
      </div>
    </div>
  </SfModal>
</template>
