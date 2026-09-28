<script setup>
import { computed, nextTick, ref } from "vue";
import { useCopy } from "@/hooks";

const visible = ref(false);
const shareCardRef = ref();

// 分享地址使用简历页面，并携带当前简历标识，不暴露编辑器路径
const resumeUrl = computed(() => {
  return "http://qzresume.cn";
});

// 复制当前简历的公开地址
const copyLink = () => {
  useCopy("轻舟简历永久地址：" + resumeUrl.value);
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
  link.download = "轻舟简历回家地址.png";
  link.click();
  URL.revokeObjectURL(url);
};

// 跳转购买页面
const goBuy = () => {
  window.open("https://www.rainyun.com/MTI2MTg0MA==_", "_blank");
};
</script>

<template>
  <!-- 分享入口位于问题反馈上方，并保留 12px 间距 -->
  <div
    class="flex-c fixed -right-30 bottom-20 z-50 cursor-pointer rounded-l-3xl bg-sf-theme p-3 text-sf-theme-text transition-all duration-300 hover:-translate-x-28"
    @click="visible = true"
  >
    <SfIcon icon="ph:paper-plane-right-fill" size="5" />
    <span class="pr-6 pl-3 text-sm whitespace-nowrap">分享{{ $t("core.router.resume") }}</span>
  </div>

  <SfModal v-model="visible" title="分享轻舟简历">
    <div class="flex w-[360px] flex-col items-center gap-3">
      <div
        ref="shareCardRef"
        class="flex gap-3 rounded-3xl border border-sf-theme bg-sf-primary p-3"
      >
        <div class="flex flex-col justify-between">
          <div class="text-xl font-bold text-sf-theme">轻舟简历</div>
          <div class="">愿此简历，</div>
          <div>能带你去往想去的地方。</div>
          <!-- <div>永久地址</div> -->
          <div>{{ resumeUrl }}</div>
        </div>
        <div class="h-30 w-30 rounded-3xl bg-white">
          <SfQrcode :value="resumeUrl" :size="220" />
        </div>
      </div>
      <div class="flex w-full gap-3">
        <SfButton class="flex-1" @click="saveQrCode">保存图片</SfButton>
        <SfButton class="flex-1" type="bg" @click="copyLink">复制链接</SfButton>
      </div>
      <div class="whitespace-normal">
        <span>
          同款云服务器 免备案， <span class="text-sf-theme">2</span>核<span class="text-sf-theme"
            >2</span
          >G<span class="text-sf-theme">20</span>M 三网直连(CN2+CMI+CUG)
          ≈35ms，首月5折，仅需16.5元/月。</span
        >
        <span class="cursor-pointer font-medium text-sf-theme" @click="goBuy"> 点击这里购买 </span>
      </div>
    </div>
  </SfModal>
</template>
