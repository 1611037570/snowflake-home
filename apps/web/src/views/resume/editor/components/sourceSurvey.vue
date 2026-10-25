<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

// 已提交标记：跨会话永久保存，提交后不再提示
const SUBMITTED_KEY = "snowflake-resume-source-survey";
// 本次会话已展示标记：刷新不清除，关闭浏览器后重新进入才重置
const SHOWN_KEY = "snowflake-resume-source-survey-shown";

// 来源选项：顺序与展示保持一致，文案由 i18n 提供
const SOURCE_KEYS = [
  "xiaohongshu",
  "douyin",
  "baidu",
  "bing",
  "google",
  "wechatOfficial",
  "channels",
  "moments",
  "miniProgram",
  "doubao",
  "yuanbao",
  "tongyi",
  "bilibili",
  "twitter",
  "reddit",
  "friend",
  "other",
];

const visible = ref(false);
// 当前选中的来源，空字符串表示未选
const selected = ref("");

const sourceList = computed(() =>
  SOURCE_KEYS.map((key) => ({ key, label: `resumeSurveySource_${key}` })),
);

onMounted(() => {
  // 已提交过永久不再提示
  if (localStorage.getItem(SUBMITTED_KEY)) return;
  // 本次会话已经弹过：刷新页面不重复打扰
  if (sessionStorage.getItem(SHOWN_KEY)) return;
  // 展示时立即登记，保证刷新后再进来不会重弹
  sessionStorage.setItem(SHOWN_KEY, "1");
  visible.value = true;
});

// 单选：再次点击已选项取消选择
const selectSource = (key: string) => {
  selected.value = selected.value === key ? "" : key;
};

// 提交来源：答案与时间仅留存本地，并写入已提交标记
const submit = () => {
  if (!selected.value) return;
  try {
    localStorage.setItem(
      SUBMITTED_KEY,
      JSON.stringify({ source: selected.value, time: new Date().toISOString() }),
    );
  } catch {
    // 本地存储不可用时仍关闭弹窗，避免反复打扰
  }
  visible.value = false;
};

// 以后再说只关闭本次，下次新会话仍会提示
const dismiss = () => {
  visible.value = false;
};
</script>

<template>
  <Transition name="survey-rise">
    <aside
      v-if="visible"
      class="fixed right-3 bottom-3 z-40 w-[min(100vw-1.5rem,380px)] rounded-3xl border border-sf-b bg-sf-primary p-3 shadow-xl"
      role="dialog"
      :aria-label="$t('resumeSurveyTitle')"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sf-success-2 text-sf-success"
          >
            <SfIcon icon="ph:megaphone-fill" size="5" />
          </span>
          <h2 class="pt-1 text-base font-black text-sf-text">{{ $t("resumeSurveyTitle") }}</h2>
        </div>
        <button
          type="button"
          class="cursor-pointer rounded-lg p-1 text-sf-text-3 transition-colors hover:bg-sf-bg hover:text-sf-text"
          :aria-label="$t('resumeSurveyClose')"
          @click="dismiss"
        >
          <SfIcon icon="lucide:x" size="4" />
        </button>
      </div>

      <p class="mt-3 pl-12 text-sm leading-normal text-sf-text-2">
        {{ $t("resumeSurveyDescription") }}
      </p>

      <div class="mt-3 flex flex-wrap gap-3">
        <button
          v-for="item in sourceList"
          :key="item.key"
          type="button"
          class="cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors"
          :class="
            selected === item.key
              ? 'border-sf-theme bg-sf-theme-3 font-medium text-sf-theme'
              : 'border-sf-b text-sf-text-2 hover:border-sf-theme hover:text-sf-theme'
          "
          :aria-pressed="selected === item.key"
          @click="selectSource(item.key)"
        >
          {{ $t(item.label) }}
        </button>
      </div>

      <div class="mt-3 flex items-center justify-end gap-3">
        <button
          type="button"
          class="cursor-pointer rounded-xl px-3 py-1 text-sm text-sf-text-2 transition-colors hover:bg-sf-bg hover:text-sf-text"
          @click="dismiss"
        >
          {{ $t("resumeSurveyLater") }}
        </button>
        <SfButton :disabled="!selected" @click="submit">{{ $t("resumeSurveySubmit") }}</SfButton>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.survey-rise-enter-active,
.survey-rise-leave-active {
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
}

.survey-rise-enter-from,
.survey-rise-leave-to {
  opacity: 0;
  transform: translateY(0.75rem);
}
</style>
