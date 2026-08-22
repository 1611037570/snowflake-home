<template>
  <div class="flex w-[480px] flex-col items-center p-3 text-sf-text">
    <!-- 标题 -->
    <h3
      class="mb-6 text-center text-2xl font-bold text-sf-theme transition-all duration-300 hover:scale-[1.02]"
    >
      支持项目发展
    </h3>

    <!-- 描述 -->
    <div class="mb-3 text-center leading-relaxed text-sf-text">
      如果您也喜欢我的项目，简单的捐赠就是对我最大的物质和精神支持。
      <br />
      您的每一份支持都将帮助项目持续发展和改进。
    </div>

    <!-- 支付方式容器 -->
    <div class="mt-3 mb-6 grid w-full grid-cols-2 gap-2">
      <div
        v-for="item in list"
        :key="item.name"
        class="flex flex-col items-center transition-all duration-300 hover:-translate-y-1"
      >
        <div
          class="h-64 w-48 overflow-hidden rounded-xl bg-white p-1 shadow-md transition-all duration-300 hover:shadow-2xl"
        >
          <SfImg
            :src="item.value"
            :alt="item.name"
            fit="contain"
            class="h-full w-full cursor-pointer rounded-lg p-4 transition-all duration-200 hover:scale-[1.05] hover:brightness-[1.02]"
          />
        </div>
        <span
          class="mt-3 font-semibold text-sf-text transition-colors duration-200 hover:text-sf-theme"
          >{{ item.name }}</span
        >
      </div>
    </div>

    <!-- 其他支持方式 -->
    <div class="border-sf-b w-full border-t pt-6">
      <div class="mb-4 text-center text-lg font-medium text-sf-text/90">其他支持方式</div>
      <div class="mb-4 text-sf-text/80">除了资金赞助，您还可以通过以下方式支持项目：</div>
      <div class="mb-3 flex items-center gap-2 transition-all duration-200 hover:text-sf-theme/90">
        <span class="text-sf-theme">⭐</span>
        <span>Star 项目：在 GitHub 上给项目点 Star</span>
        <span
          class="ml-auto cursor-pointer rounded-full font-medium text-sf-theme transition-all duration-200"
        >
          <img
            @click="goGitHub"
            src="https://img.shields.io/github/stars/1611037570/snowflake-home.svg"
            alt="GitHub Stars"
            class="h-6 w-18"
          />
        </span>
      </div>
      <div class="flex items-center gap-2 transition-all duration-200 hover:text-sf-theme/90">
        <span class="text-sf-theme">📤</span>
        <span>分享推广：向朋友和同事推荐</span>
        <span
          class="ml-auto cursor-pointer rounded-full bg-sf-theme/10 px-4 py-1 font-medium text-sf-theme transition-all duration-200 hover:bg-sf-theme hover:text-white"
          @click="goShare"
        >
          点我分享
        </span>
      </div>
    </div>

    <!-- 感谢语 -->
    <div
      class="mt-8 text-center text-lg font-medium text-sf-theme/80 italic transition-all duration-300 hover:text-sf-theme"
    >
      感谢您的支持！
    </div>
  </div>
</template>

<script setup>
import { useCopy } from "@/hooks";
// 导入支付图片
import aliPay from "@/assets/images/aliPay.jpg";
import weChatPay from "@/assets/images/weChatPay.jpg";

// 支付方式列表
const list = [
  { name: "支付宝", value: aliPay },
  { name: "微信支付", value: weChatPay },
];

function goGitHub() {
  urlNavigation("https://github.com/1611037570/snowflake-home");
}

function goShare() {
  const currentUrl = window.location.href;
  const shareText = `${currentUrl}`;
  useCopy(shareText);
}
</script>
