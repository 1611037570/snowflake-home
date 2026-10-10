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
const { t, locale } = useI18n();
const { stars, stale, loading, failed, refresh } = useGithubStars();
const formattedStars = computed(() => stars.value?.toLocaleString(locale.value));
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
    class="border-sf-border hover:bg-sf-bg-hover inline-flex h-9 shrink-0 items-center gap-3 rounded-full border px-3 text-sm font-medium text-sf-text transition-colors focus-visible:outline-2 focus-visible:outline-sf-theme"
    :title="statusText"
    :aria-label="stars === null ? statusText : `${statusText} (${formattedStars})`"
    :aria-busy="loading"
  >
    <SfIcon icon="simple-icons:github" size="5" class="text-sf-text!" />
    <span class="hidden xl:inline">{{ $t("resumeGithubStarsLabel") }}</span>
    <span v-if="stars !== null" class="tabular-nums" :class="{ 'text-sf-text-3': stale }">
      {{ formattedStars }}
    </span>
    <span v-if="loading || stale || failed" class="sr-only">{{ statusText }}</span>
  </a>
</template>
