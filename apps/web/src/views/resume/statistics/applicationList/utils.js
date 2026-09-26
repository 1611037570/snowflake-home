// 投递记录模块公共工具：平台/状态选项、平台文案、按钮样式
import { APPLICATION_PLATFORM, FOLLOW_UP_STATUS } from "@/stores";
import { $t } from "@/locales";

const platformLocaleKeys = {
  boss: "resumeStatisticsPlatformBoss",
  zhilian: "resumeStatisticsPlatformZhilian",
  "51job": "resumeStatisticsPlatform51job",
  liepin: "resumeStatisticsPlatformLiepin",
  other: "resumeStatisticsOther",
};

const statusLocaleKeys = {
  interview: "resumeStatisticsStatusInterview",
  offer: "resumeStatisticsStatusOffer",
  rejected: "resumeStatisticsStatusRejected",
};

export const getPlatformOptions = () => APPLICATION_PLATFORM.map((item) => ({
  value: item.value,
  name: $t(platformLocaleKeys[item.value] || "resumeStatisticsOther"),
}));

export const getFollowUpStatusOptions = () => FOLLOW_UP_STATUS.map((item) => ({
  value: item.value,
  name: $t(statusLocaleKeys[item.value] || item.label),
}));

// 平台标签文案
export const getPlatformLabel = (platform) => {
  const key = platformLocaleKeys[platform];
  return key ? $t(key) : platform || "--";
};

// 按钮公共样式（完整类名字面量，可被 Tailwind 识别）
const btnBase =
  "flex h-7 cursor-pointer items-center gap-1 rounded-full px-3 text-xs font-black transition";
export const btnOutline = `${btnBase} border border-sf-theme text-sf-theme hover:bg-sf-theme-2 hover:text-sf-theme-text`;
