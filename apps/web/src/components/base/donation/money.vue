<script setup>
// 导入支付图片
import aliPay from "@/assets/images/aliPay.webp";
import weChatPay from "@/assets/images/weChatPay.webp";

// 支付方式列表
const list = [
  { name: "支付宝", value: aliPay },
  { name: "微信支付", value: weChatPay },
];
</script>

<template>
  <!-- 描述 -->
  <div class="mb-3 text-center leading-relaxed text-sf-text">
    如果您也喜欢我的项目，一份捐赠就是对我最大的物质支持与精神鼓励。
    <br />
    您的每一份支持都将帮助项目持续发展和改进。
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
