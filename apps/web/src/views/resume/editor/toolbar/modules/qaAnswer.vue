<script setup>
import { computed, reactive, ref } from "vue";
import { isChrome, isSafari } from "@/utils";
import eventBus from "@/utils/modules/eventBus";
import { DOWNLOAD_URL, RECOMMEND_BROWSER } from "@/components/business/browserTip";
import { $t } from "@/locales";

// QA 解答弹窗可见性
const visible = ref(false);
// 非推荐浏览器：谷歌与苹果 Safari 之外才提示更换浏览器
const notSupportedBrowser = computed(() => !isChrome() && !isSafari());

// 问答条目：默认收起，逐条展开
const openedMap = reactive({});
const toggleItem = (id) => {
  openedMap[id] = !openedMap[id];
};

// 条目清单：浏览器推荐、预览样式疑问与导出失败排查
const qaItems = computed(() => [
  {
    id: "browser",
    icon: notSupportedBrowser.value ? "mdi:alert-circle" : "mdi:google-chrome",
    title: $t("qaBrowserTitle"),
  },
  {
    id: "style",
    icon: "mingcute:question-line",
    title: $t("qaStyleTitle"),
  },
  {
    id: "export",
    icon: "mdi:file-pdf-box",
    title: $t("qaExportTitle"),
  },
  {
    id: "help",
    icon: "ph:chat-teardrop-dots-fill",
    title: $t("qaHelpTitle"),
  },
]);

// 切换到标准 A4 查看真实排版，并关闭弹窗
const showStandardA4 = () => {
  visible.value = false;
  eventBus.emit("resume-standard-a4");
};

// 样式确实与预览不符时，引导到 GitHub Issues 反馈
const reportIssue = () => {
  window.open("https://github.com/1611037570/snowflake-home/issues", "_blank", "noopener,noreferrer");
};
</script>

<template>
  <!-- 右侧工具栏区域的 QA 解答入口 -->
  <SfTooltip :content="$t('qaAnswer')" placement="left">
    <SfIcon
      :icon="notSupportedBrowser ? 'mdi:alert-circle' : 'mdi:chat-question-outline'"
      size="5"
      boxSize="9"
      class="transition-all duration-300 hover:scale-105 active:scale-95"
      :class="
        notSupportedBrowser
          ? 'relative cursor-pointer rounded-xl border border-sf-warning text-sf-warning'
          : visible
            ? 'relative cursor-pointer rounded-xl border border-sf-theme text-sf-theme'
            : 'relative cursor-pointer rounded-xl border border-transparent text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme'
      "
      @click="visible = true"
    />
  </SfTooltip>

  <SfModal v-model="visible" :title="$t('qaAnswer')">
    <div class="flex w-[360px] flex-col gap-3">
      <div
        v-for="item in qaItems"
        :key="item.id"
        class="overflow-hidden rounded-xl border border-sf-b bg-sf-bg"
      >
        <button
          type="button"
          class="flex w-full cursor-pointer items-center justify-between gap-3 p-3 text-left text-sm font-semibold text-sf-text"
          :aria-expanded="Boolean(openedMap[item.id])"
          @click="toggleItem(item.id)"
        >
          <span class="flex items-center gap-3">
            <SfIcon :icon="item.icon" size="4" class="shrink-0 text-sf-text-2" />
            {{ item.title }}
          </span>
          <SfIcon
            icon="mingcute:down-line"
            size="4"
            class="shrink-0 text-sf-text-3 transition-transform duration-300"
            :class="{ '-rotate-90': !openedMap[item.id] }"
          />
        </button>
        <div v-show="openedMap[item.id]" class="border-t border-sf-b p-3 text-sm">
          <template v-if="item.id === 'browser'">
            <p class="leading-6 text-sf-text-2">
              {{ $t("qaBrowserMessage").replace("谷歌浏览器", RECOMMEND_BROWSER) }}
            </p>
            <a
              :href="DOWNLOAD_URL"
              target="_blank"
              class="mt-3 inline-block text-sf-theme underline"
              >{{ $t("downloadRecommendedBrowser").replace("谷歌浏览器", RECOMMEND_BROWSER) }}</a
            >
          </template>
          <template v-else-if="item.id === 'style'">
            <p class="leading-6 text-sf-text-2">{{ $t("qaStyleMessage") }}</p>
            <div class="mt-3 flex gap-3">
              <SfButton class="flex-1" @click="showStandardA4">{{ $t("standardA4") }}</SfButton>
              <SfButton class="flex-1" border @click="reportIssue">
                {{ $t("qaStyleFeedback") }}
              </SfButton>
            </div>
          </template>
          <template v-else-if="item.id === 'export'">
            <p class="leading-6 text-sf-text-2">{{ $t("qaExportReference") }}</p>
          </template>
          <template v-else>
            <p class="leading-6 text-sf-text-2">{{ $t("qaHelpMessage") }}</p>
            <SfButton class="mt-3 w-full" @click="reportIssue">{{ $t("qaHelpAction") }}</SfButton>
          </template>
        </div>
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
