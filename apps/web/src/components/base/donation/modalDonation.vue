<template>
  <div class="flex w-[480px] flex-col items-center text-sf-text">
    <!-- 其他支持方式 -->
    <div class="w-full pt-3">
      <div class="mb-4 text-center text-lg font-medium text-sf-text/90">
        {{ $t("core.donation.otherWays") }}
      </div>
      <div class="mb-4 text-sf-text/80">{{ $t("core.donation.otherWaysDescription") }}</div>
      <div
        class="mb-3 flex items-center gap-2 transition-all duration-200 hover:text-sf-theme/90"
        @click="goGitHub"
      >
        <span class="text-sf-theme">⭐</span>
        <span>{{ $t("core.donation.githubStars") }}</span>
        <img
          src="https://img.shields.io/github/stars/1611037570/snowflake-home.svg"
          alt="GitHub Stars"
          class="h-6 w-18"
        />
        <span
          class="ml-auto cursor-pointer rounded-full bg-sf-theme/10 px-4 py-1 font-medium text-sf-theme transition-all duration-200 hover:bg-sf-theme hover:text-white"
        >
          {{ $t("core.donation.go") }}
        </span>
      </div>
      <div
        class="flex items-center gap-2 transition-all duration-200 hover:text-sf-theme/90"
        @click="goShare"
      >
        <span class="text-sf-theme">📤</span>
        <span>{{ $t("core.donation.recommendProject") }}</span>
        <span
          class="ml-auto cursor-pointer rounded-full bg-sf-theme/10 px-4 py-1 font-medium text-sf-theme transition-all duration-200 hover:bg-sf-theme hover:text-white"
        >
          {{ $t("core.donation.go") }}
        </span>
      </div>
    </div>

    <!-- 感谢语 -->
    <div
      class="mt-8 text-center text-lg font-medium text-sf-theme/80 italic transition-all duration-300 hover:text-sf-theme"
    >
      {{ $t("core.donation.thanks") }}
    </div>
  </div>
</template>

<script setup>
import { useCopy } from "@/hooks";

function goGitHub() {
  urlNavigation("https://github.com/1611037570/snowflake-home");
}

function goShare() {
  const currentUrl = window.location.href;
  const shareText = `${currentUrl}`;
  useCopy(shareText);
}
</script>
