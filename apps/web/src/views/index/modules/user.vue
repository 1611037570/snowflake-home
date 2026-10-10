<script setup>
import { DEV_ACCOUNT, SHOOT_ACCOUNT } from "@/configs";
import { userInfo } from "@/views/index/data";
import dayjs from "dayjs";
import { computed } from "vue";
import QrIcon from "../components/qrIcon.vue";

const now = dayjs();

const devYears = computed(() => {
  return now.diff(dayjs(userInfo.value.devYears), "year");
});
const shootYears = computed(() => {
  return now.diff(dayjs(userInfo.value.shootYears), "year");
});
</script>

<template>
  <div class="minimal-about w-dwh relative z-10 overflow-hidden bg-sf-bg px-6 py-24 text-sf-text lg:px-12" id="about">
    <!-- 背景装饰 -->
    <div
      class="hidden"
      :class="[$s(80, 'w'), $s(80, 'h')]"
    ></div>
    <div
      class="hidden"
      :class="[$s(60, 'w'), $s(60, 'h')]"
    ></div>

    <!-- 主卡片 -->
    <div
      class="minimal-profile relative mx-auto grid w-full max-w-[1080px] items-center gap-9"

    >
      <!-- 个人信息 -->
      <div class="minimal-info flex flex-col items-start text-left">
        <div class="mb-3 font-normal tracking-widest text-sf-text-2" :class="$s(5)">Hi~ 我是</div>
        <div class="minimal-name font-semibold tracking-tight text-sf-base" :class="$s(14)">
          {{ userInfo.name }}
        </div>

        <!-- 标签信息 -->
        <div class="mt-6 flex flex-wrap items-center gap-3 text-sf-text-2">
          <div
            class="flex items-center gap-3 text-sm"
          >
            <span>📍</span>
            <span>{{ userInfo.location }}</span>
          </div>
          <div
            class="flex items-center gap-3 text-sm"
          >
            <span>💻</span>
            <span>{{ userInfo.job }}</span>
          </div>
        </div>
      </div>

      <!-- 社交账号 -->
      <div class="minimal-social flex flex-wrap gap-6">
        <!-- <QrIcon v-for="item in SHOOT_ACCOUNT" :key="item.name" :item="item" />
        <div class="mx-2 h-8 w-px self-center bg-sf-border/50"></div> -->
        <QrIcon v-for="item in DEV_ACCOUNT" :key="item.name" :item="item" />
      </div>

      <!-- 悬浮经验卡片 - 开发 -->
      <div
        class="minimal-experience minimal-dev border-l border-sf-b pl-9"
      >
        <div class="flex flex-col items-center">
          <div class="minimal-number font-light text-sf-base" :class="$s(8)">
            {{ devYears }}<span class="ml-1 text-sm text-sf-text-2">年</span>
          </div>
          <div class="text-xs font-medium text-sf-text-2">开发经验</div>
        </div>
      </div>

      <!-- 悬浮经验卡片 - 摄影 -->
      <div
        class="minimal-experience minimal-photo border-l border-sf-b pl-9"
      >
        <div class="flex flex-col items-center">
          <div class="minimal-number font-light text-sf-base" :class="$s(8)">
            {{ shootYears }}<span class="ml-1 text-sm text-sf-text-2">年</span>
          </div>
          <div class="text-xs font-medium text-sf-text-2">摄影经验</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.breath {
  animation: breath 8s ease-in-out infinite;
}
.breath-delayed {
  animation-delay: 4s;
}
@keyframes breath {
  0%,
  100% {
    transform: scale(1) translate(0, 0);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2) translate(10px, -10px);
    opacity: 0.6;
  }
}
</style>

<style scoped>
/* 用留白、细线和文字层次统一后续区域。 */

.minimal-about { border-top: 1px solid var(--sf-border); scroll-margin-top: 80px; }
.minimal-profile { grid-template-columns: minmax(0, 1fr) 150px 150px; }
.minimal-info { grid-column: 1; grid-row: 1; }
.minimal-name { font-size: 56px; line-height: 1.3; }
.minimal-social { grid-column: 1; grid-row: 2; }
.minimal-dev { grid-column: 2; grid-row: 1 / 3; }
.minimal-photo { grid-column: 3; grid-row: 1 / 3; }
.minimal-experience > div { align-items: flex-start; gap: 12px; }
.minimal-number { font-size: 54px; line-height: 1; font-variant-numeric: tabular-nums; }
.minimal-experience .text-xs { color: var(--sf-text-2); }
@media (max-width: 767px) {
  .minimal-profile { grid-template-columns: 1fr 1fr; }
  .minimal-info, .minimal-social { grid-column: 1 / -1; }
  .minimal-dev { grid-column: 1; grid-row: 3; }
  .minimal-photo { grid-column: 2; grid-row: 3; }
  .minimal-experience { border-left: 0; border-top: 1px solid var(--sf-border); padding: 24px 0 0; }
  .minimal-name { font-size: 42px; }
  .minimal-number { font-size: 42px; }
}

</style>
