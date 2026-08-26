<script setup>
import { useThemeStore } from "@/stores";
import { useClipboard } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/preview.css";
import { storeToRefs } from "pinia";
import ToggleButton from "./toggleButton.vue";

const props = defineProps({
  msg: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});
// 重试回调，由 index.vue 通过 provide 注入
const retry = inject("retry");

const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);
const { copy, isSupported } = useClipboard();

const emit = defineEmits(["updateCollapsedStatus", "sendFollowQuestion"]);

const handleCopy = async (text) => {
  if (!isSupported.value) {
    ElMessage.error("当前浏览器不支持复制");
    return;
  }
  await copy(text);
  ElMessage.success("复制成功");
};

const resumeContent = computed(() => {
  const value = props.msg.content;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
});
// 消息内容
const content = computed(() => {
  // 返回简历分析结果
  return resumeContent.value.analysis;
});
const resumeShow = computed(() => props.msg.requestStatus === "success");
// AI 加载动画序列：文字逐字 + 三个圆点，统一按顺序接力跳动
const loadingItems = [..."生成中", "", "", ""];
</script>

<template>
  <!-- 消息主体 -->
  <article
    class="group flex w-full min-w-0 flex-col items-start gap-1.5 transition-all duration-300"
  >
    <!-- 用户名与时间 -->
    <header class="flex w-full flex-row items-center justify-between gap-1 px-1 select-none">
      <div class="flex items-center gap-1">
        <div class="flex flex-col gap-0.5 leading-tight">
          <span class="text-[12px] font-black tracking-wider text-sf-text">{{
            $t("router.resumeAI")
          }}</span>
          <div class="flex items-center gap-1">
            <time v-if="msg.time" class="text-[11px] font-bold tabular-nums opacity-40">{{
              msg.time
            }}</time>
          </div>
        </div>

        <!-- 回复内容切换 (美化后的胶囊风格) -->
        <ToggleButton
          v-if="resumeShow"
          label="回复内容"
          :collapsed="msg.contentCollapsed"
          @toggle="emit('updateCollapsedStatus', index, 'content')"
        />
      </div>

      <div
        v-if="msg.total_tokens"
        class="flex items-center gap-1 text-[11px] font-black text-sf-text-3"
      >
        <SfIcon icon="ph:lightning-duotone" size="4" class="animate-pulse text-amber-500" />
        <span class="opacity-70">{{ msg.total_tokens }} tokens</span>
      </div>
    </header>

    <div class="flex w-full flex-col gap-1 pr-1">
      <!-- 加载状态 -->
      <div
        v-if="msg.requestStatus === 'loading'"
        class="flex h-8 w-[50px] items-center justify-center gap-1.5 rounded-xl bg-sf-theme-2 text-sf-theme"
      >
        <template v-for="(item, i) in 3" :key="i">
          <span
            class="h-1.5 w-1.5 animate-bounce rounded-full bg-sf-theme opacity-80"
            :style="`animation-delay: ${(i - 1) * 150}ms`"
          ></span>
        </template>
      </div>
      <!-- 错误状态 -->
      <div
        v-if="msg.requestStatus === 'error'"
        class="flex h-8 w-[170px] cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-sf-error-2 text-[14px] text-sf-error"
        @click="retry(msg)"
      >
        生成失败，点击重试!
      </div>
      <!-- 正式回复内容 -->
      <div
        class="relative w-full min-w-0"
        v-if="msg.requestStatus === 'success' && !msg.contentCollapsed"
      >
        <MdPreview
          v-if="content"
          :modelValue="content"
          :theme="theme"
          editorId="ai-preview"
          class="inline-block max-w-full min-w-0 overflow-hidden bg-transparent! p-0! align-bottom text-[14px] leading-relaxed text-sf-text"
          :class="{ 'typing-active': msg.typing }"
        />
        <div class="mt-2 flex flex-col gap-2">
          <div
            v-for="(item, index) in resumeContent.followQuestions"
            :key="index"
            class="cursor-pointer rounded-lg border border-sf-b bg-sf-bg-2 px-3 py-2 text-[13px] text-sf-text transition-all duration-200 hover:border-sf-theme hover:bg-sf-bg-2"
            @click="emit('sendFollowQuestion', item)"
          >
            {{ item }}
          </div>
        </div>
      </div>
      <!-- 操作区域 -->
      <nav
        v-if="msg.content && !msg.typing && resumeShow"
        class="flex items-center gap-1 transition-opacity duration-300"
      >
        <SfTooltip content="复制">
          <button class="action-btn" @click="handleCopy(msg.content)">
            <SfIcon icon="ph:copy-duotone" size="3.5" />
          </button>
        </SfTooltip>
      </nav>
    </div>
  </article>
</template>

<style scoped>
@reference "@/styles/tailwind.css";

/* 操作按钮公共样式 */
.action-btn {
  @apply flex h-7 w-7 items-center justify-center rounded-lg text-sf-text-3 transition-colors hover:bg-sf-bg-3 hover:text-sf-text;
}
:deep(.md-editor-preview h2) {
  margin: 14px 0 !important;
}
/* MdPreview 样式调整 */
:deep(.md-editor-preview) {
  font-size: inherit;
  line-height: 1.7;
  color: var(--color-sf-text);
  word-break: break-word;
}
:deep(.md-editor-preview p) {
  margin-bottom: 0.75em;
}
:deep(.md-editor-preview p:last-child) {
  margin: 0 !important;
}
:deep(#thought-preview .md-editor-preview) {
  color: inherit;
  font-style: inherit;
  font-size: 0.95em;
}
:deep(.md-editor-preview pre) {
  /* margin: 0.75em 0; */
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
:deep(.md-editor-preview .md-editor-code .md-editor-code-head) {
  z-index: 20;
}
/* 打字机闪烁光标效果优化 */
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

/* 将光标附着在预览内容最后一行（兼容段落、列表、代码块等） */
:deep(.typing-active .md-editor-preview > *:last-child)::after,
:deep(.typing-active .md-editor-preview > *:last-child li:last-child)::after {
  content: "";
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background-color: var(--color-sf-theme);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 1s step-end infinite;
  border-radius: 2px;
}
</style>
