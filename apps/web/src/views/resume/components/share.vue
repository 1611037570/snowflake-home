<script setup>
import { computed, nextTick, ref } from "vue";
import { useCopy } from "@/hooks";
import { $t } from "@/locales";
import { SITE_URL } from "./config";

const visible = ref(false);
const shareCardRef = ref();

// 统一打开分享弹窗，供默认悬浮入口和编辑器工具轨复用。
const openShare = () => {
  visible.value = true;
};

// 分享地址使用简历页面，并携带当前简历标识，不暴露编辑器路径
const resumeUrl = computed(() => {
  return SITE_URL;
});

// 复制当前简历的公开地址
const copyLink = () => {
  useCopy($t("resumeSharePermanentUrl", { url: resumeUrl.value }));
};

// 将分享卡片渲染为图片并保存到本地
const saveQrCode = async () => {
  await nextTick();
  await document.fonts?.ready;
  const card = shareCardRef.value;
  if (!card) return;

  const { snapdom } = await import("@zumer/snapdom");
  const canvas = await snapdom.toCanvas(card, {
    scale: 2,
    embedFonts: true,
  });
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = $t("resumeShareImageName");
  link.click();
  URL.revokeObjectURL(url);
};

// 跳转购买页面
const goBuy = () => {
  window.open("https://www.rainyun.com/qz_", "_blank");
};
</script>

<template>
  <slot name="trigger" :open="openShare" :visible="visible">
    <!-- 分享入口位于问题反馈上方，并保留 12px 间距 -->
    <div
      class="flex-c fixed -right-30 bottom-20 z-50 cursor-pointer rounded-l-3xl bg-sf-theme p-3 text-sf-theme-text transition-all duration-300 hover:-translate-x-28"
      @click="openShare"
    >
      <SfIcon icon="ph:paper-plane-right-fill" size="5" />
      <span class="pr-6 pl-3 text-sm whitespace-nowrap">{{ $t("resumeShareTitle") }}</span>
    </div>
  </slot>

  <SfModal v-model="visible" :title="$t('resumeShareTitle')">
    <div class="flex w-[360px] flex-col items-center gap-3">
      <div
        ref="shareCardRef"
        class="flex gap-3 rounded-3xl border border-sf-theme bg-sf-primary p-3"
      >
        <div class="flex flex-col justify-between">
          <div class="text-xl font-bold text-sf-theme">{{ $t("core.router.resume") }}</div>
          <div class="">{{ $t("resumeShareSloganLine1") }}</div>
          <div>{{ $t("resumeShareSloganLine2") }}</div>
          <!-- <div>永久地址</div> -->
          <div>{{ resumeUrl }}</div>
        </div>
        <div class="h-30 w-30 rounded-3xl bg-white">
          <SfQrcode :value="resumeUrl" :size="220" />
        </div>
      </div>
      <div class="flex w-full gap-3">
        <SfButton class="flex-1" @click="saveQrCode">{{ $t("resumeShareSaveImage") }}</SfButton>
        <SfButton class="flex-1" type="bg" @click="copyLink">{{ $t("resumeShareCopyLink") }}</SfButton>
      </div>
      <div>{{ $t("resumeBookmarkTip") }}</div>
      <div class="whitespace-normal">
        <span>
          {{ $t("resumeShareCloudAdPrefix") }}<span class="text-sf-theme">2</span>{{ $t("resumeShareCloudAdCpu") }}<span class="text-sf-theme"
            >2</span
          >{{ $t("resumeShareCloudAdMemory") }}<span class="text-sf-theme">20</span>{{ $t("resumeShareCloudAdNetwork") }}</span
        >
        <span class="cursor-pointer font-medium text-sf-theme" @click="goBuy">{{ $t("resumeShareCloudAdBuy") }}</span>
      </div>
    </div>
  </SfModal>
</template>
