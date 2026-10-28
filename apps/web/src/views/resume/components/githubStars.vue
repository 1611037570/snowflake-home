<script setup>
import { computed, onMounted, provide } from "vue";
import { useI18n } from "vue-i18n";
import SimpleIconsGithubIcon from "@iconify-vue/simple-icons/github";
import { SF_ICON_LIST_KEY } from "@/components/base/icon";
import { GITHUB_REPOSITORY_URL } from "@/apis/github";
import { useGithubStars } from "@/hooks/modules/useGithubStars";

// 业务入口使用本地图标，避免额外的在线图标请求。
provide(SF_ICON_LIST_KEY, {
  "simple-icons:github": SimpleIconsGithubIcon, // 仓库入口图标
});

// 图形尺寸与交互区域分别配置，默认保留其他页面的原有外观。
const props = defineProps({
  // 图标图形大小，使用间距单位。
  size: { type: [String, Number], default: 8 },
  // 图标交互区域大小，未设置时沿用图形大小。
  boxSize: { type: [String, Number], default: undefined },
});

const { t, locale } = useI18n();
const { stars, stale, loading, failed, refresh } = useGithubStars();
const formattedStars = computed(() => stars.value?.toLocaleString(locale.value));
// 角标使用短数字，大数量的完整值仍保留在悬停提示中。
const badgeStars = computed(() =>
  stars.value?.toLocaleString(locale.value, {
    notation: "compact", // 大数量使用紧凑单位
    maximumFractionDigits: 1, // 最多保留一位小数
  }),
);
const statusText = computed(() => {
  if (loading.value) return t("resumeGithubStarsLoading");
  if (failed.value || stale.value) return t("resumeGithubStarsUnavailable");
  return t("resumeGithubStarsLabel");
});

// 异步读取不阻塞页头与简历页面加载。
onMounted(refresh);
</script>

<template>
  <a
    :href="GITHUB_REPOSITORY_URL"
    target="_blank"
    rel="noopener noreferrer"
    class="group hover:bg-sf-bg-hover relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sf-text transition-colors hover:text-sf-theme focus-visible:outline-2 focus-visible:outline-sf-theme"
    :aria-label="stars === null ? statusText : `${statusText} (${formattedStars})`"
    :aria-busy="loading"
  >
    <!-- 与主题、语言入口对齐，仅用小角标承载数量。 -->
    <SfIcon
      icon="simple-icons:github"
      :size="props.size"
      :box-size="props.boxSize"
      class="text-inherit!"
      :class="props.boxSize ? 'cursor-pointer rounded-lg transition-colors hover:bg-sf-bg' : 'transition-transform duration-200 motion-safe:group-hover:scale-110'"
    />
    <span
      v-if="stars !== null"
      class="absolute top-0 right-0 inline-flex h-4.5 min-w-4.5 translate-x-1/3 -translate-y-1/3 items-center justify-center rounded-full border-2 border-sf-primary bg-sf-theme text-[10px] leading-none font-semibold text-sf-theme-text tabular-nums"
      :class="{ 'opacity-60': stale }"
    >
      {{ badgeStars }}
    </span>
    <span v-if="loading || stale || failed" class="sr-only">{{ statusText }}</span>
  </a>
</template>
