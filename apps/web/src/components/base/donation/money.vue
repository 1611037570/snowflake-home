<script setup>
import { computed } from "vue";
import i18n, { $t } from "@/locales";
// 导入支付图片
import aliPay from "@/assets/images/aliPay.webp";
import weChatPay from "@/assets/images/weChatPay.webp";

// 支付方式列表
const list = computed(() => {
  i18n.global.locale.value;
  return [
    { name: $t("core.donation.alipay"), value: aliPay },
    { name: $t("core.donation.wechatPay"), value: weChatPay },
  ];
});
</script>

<template>
  <!-- 描述 -->
  <div class="mb-3 text-center leading-relaxed text-sf-text">
    {{ $t("core.donation.donationDescription") }}
    <br />
    {{ $t("core.donation.donationImpact") }}
  </div>

  <!-- 支付方式容器 -->
  <div class="mt-3 mb-3 grid w-full grid-cols-2 gap-2">
    <div
      v-for="item in list"
      :key="item.name"
      class="group flex-c flex-col items-center rounded-3xl border border-sf-b p-5 transition-all duration-300"
    >
      <SfImg
        :src="item.value"
        :alt="item.name"
        fit="contain"
        class="h-64 w-48 cursor-pointer transition-all duration-200 group-hover:scale-[1.05]"
      />
      <span class="mt-3 font-semibold text-sf-text">{{ item.name }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
