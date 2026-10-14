<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColor },
} = useResumePreviewContext();

// 页眉烫金与暖纸配色成对出现，轴线与条目节点共用同一组色值。
const GOLD = "#A9824A";
const headerStyle = computed(() => ({
  "--chronicle-gold": GOLD, // 页眉装饰金
  "--chronicle-gold-line": `color-mix(in srgb, ${GOLD} 45%, transparent)`, // 金色细线
  "--chronicle-paper": ui.value?.page?.background || "#FFFFFF", // 纸张底色，供节点遮线取色
  "--resume-user-name-family": "SimSun, Songti SC, STSong, serif", // 姓名改用宋体压住暖纸
  "--resume-user-name-color": themeColor.value, // 姓名沿用主题墨蓝
  "--resume-user-name-spacing": "0.06em", // 姓名略微加宽字距
  "--resume-user-subtitle-family": "SimSun, Songti SC, STSong, serif", // 副标题跟随姓名字体
  "--resume-user-subtitle-color": GOLD, // 副标题用烫金区分层级
  "--resume-user-contact-label-color": "#6B6355", // 资料标签使用暖灰，避免与数值抢色
  "--resume-user-icon-color": GOLD, // 资料图标与页眉装饰同色
  "--resume-user-avatar-radius": "2px", // 头像接近方角，呼应档案信笺气质
  "--resume-user-avatar-border": `1px solid var(--chronicle-gold-line)`, // 头像描边取淡金
  "--chronicle-bleed": "var(--resume-page-inset-horizontal)", // 页眉底板与收尾金线延伸到纸张左右边的距离
}));
</script>

<template>
  <!-- 页眉底板与收尾金线向纸张左右边铺满，上下仍停在纸张留白之内。 -->
  <div class="relative isolate box-border flex w-full min-w-0" :style="headerStyle">
    <span
      aria-hidden="true"
      class="pointer-events-none absolute -z-10 bottom-0"
      :style="{
        top: 'calc(-1 * var(--resume-page-inset-vertical, 0px))',
        left: 'calc(-1 * var(--chronicle-bleed))',
        right: 'calc(-1 * var(--chronicle-bleed))',
        backgroundColor: `color-mix(in srgb, ${GOLD} 5%, var(--chronicle-paper))`,
      }"
    />
    <span
      aria-hidden="true"
      class="pointer-events-none absolute bottom-0 h-px"
      :style="{
        left: 'calc(-1 * var(--chronicle-bleed))',
        right: 'calc(-1 * var(--chronicle-bleed))',
        backgroundColor: 'var(--chronicle-gold-line)',
      }"
    />
    <span
      aria-hidden="true"
      class="pointer-events-none absolute bottom-0 h-[3px] w-12"
      :style="{ left: 'var(--resume-page-inset-horizontal)', backgroundColor: 'var(--chronicle-gold)' }"
    />
    <slot />
  </div>
</template>
