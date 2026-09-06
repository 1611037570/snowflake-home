<script setup>
import { useThemeStore } from "@/stores";
import { useClipboard } from "@vueuse/core";
import { ElMessage } from "element-plus";
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
  isLast: {
    type: Boolean,
    default: false,
  },
});
// 重试回调，由 index.vue 通过 provide 注入
const retry = inject("retry");

const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);
const { copy, isSupported } = useClipboard();

const emit = defineEmits(["updateCollapsedStatus", "sendFollowQuestion", "fillFollowQuestion"]);

// 将推荐问题填入输入框，不触发发送
const handleFillFollowQuestion = (event, question) => {
  event.stopPropagation();
  emit("fillFollowQuestion", question);
};

const handleCopy = async (text) => {
  if (!isSupported.value) {
    ElMessage.error("当前浏览器不支持复制");
    return;
  }
  await copy(text);
  ElMessage.success("复制成功");
};

const parsedContent = computed(() => {
  const value = props.msg.content;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
});
// 消息内容：新版直接保存 Markdown 正文，旧版兼容 JSON 中的 analysis
const content = computed(() => {
  const obj = parsedContent.value;
  if (obj && typeof obj === "object" && typeof obj.analysis === "string") {
    return obj.analysis;
  }
  return props.msg.content;
});
// 推荐追问：优先读取消息字段（由请求流程补充），旧版兼容 JSON 中的 followQuestions
const followQuestions = computed(() => {
  if (Array.isArray(props.msg.followQuestions) && props.msg.followQuestions.length) {
    return props.msg.followQuestions;
  }
  const obj = parsedContent.value;
  return Array.isArray(obj?.followQuestions) ? obj.followQuestions : [];
});
const resumeShow = computed(() => props.msg.requestStatus === "success");
const isThinking = computed(() => props.msg.typing && props.msg.requestStatus === "thinking");
const isGenerating = computed(() => props.msg.typing && props.msg.requestStatus === "generating");
const hasThought = computed(() => !!props.msg.thought?.trim());
const hasContent = computed(() => !!content.value?.trim());
// 等待态文案：优先展示当前执行动作，其次回退到思考/生成计时
const statusText = computed(() => {
  if (props.msg.stepLabel) return props.msg.stepLabel;
  if (isThinking.value) return `思考中 ${props.msg.thoughtTime || 0} 秒`;
  if (isGenerating.value) return `生成回复中 ${props.msg.contentTime || 0} 秒`;
  return "生成中";
});
const totalTime = computed(() => (props.msg.thoughtTime || 0) + (props.msg.contentTime || 0));
const showTotalTime = computed(() => props.msg.requestStatus === "success" && totalTime.value > 0);
</script>

<template>
  <!-- 消息主体 -->
  <article class="group flex w-full min-w-0 flex-col items-start transition-all duration-300">
    <!-- 用户名与时间 -->
    <header class="flex w-full flex-row items-center justify-between gap-1 select-none">
      <div class="flex items-center gap-1">
        <div class="text-[12px] leading-tight font-black text-sf-text">
          {{ $t("router.resumeAI") }}
        </div>

        <!-- 回复内容切换 (美化后的胶囊风格) -->
        <ToggleButton
          v-if="hasContent"
          label="回复内容"
          :collapsed="msg.contentCollapsed"
          @toggle="emit('updateCollapsedStatus', index, 'content')"
        />
        <ToggleButton
          v-if="hasThought"
          label="执行过程"
          :collapsed="msg.thoughtCollapsed"
          @toggle="emit('updateCollapsedStatus', index, 'thought')"
        />
      </div>

      <div class="flex items-center gap-3 text-[11px] text-sf-text-2">
        <div v-if="msg.total_tokens" class="flex items-center gap-1">
          <span>{{ msg.total_tokens }} tokens</span>
        </div>
        <span v-if="showTotalTime"> 耗时 {{ totalTime }} 秒 </span>
      </div>
    </header>
    <!-- 加载状态 -->
    <div
      v-if="msg.typing && ['loading', 'thinking', 'generating'].includes(msg.requestStatus)"
      class="flex items-center gap-2 px-1 text-[13px] text-sf-theme"
    >
      <span>{{ statusText }}</span>
      <span class="flex items-center gap-1">
        <i v-for="i in 3" :key="i" class="h-1.5 w-1.5 animate-bounce rounded-full bg-sf-theme" />
      </span>
    </div>
    <!-- 执行过程：运行中实时展示思考/工具/观察，完成后按折叠状态展示 -->
    <div
      v-if="hasThought && !msg.thoughtCollapsed"
      class="mt-1 mb-3 max-h-72 w-full max-w-full overflow-y-auto rounded-xl px-3 py-2 text-[12px] text-sf-text-2"
    >
      <SfMdPreview
        :modelValue="msg.thought"
        :theme="theme"
        :editorId="`thought-preview-${index}`"
        class="bg-transparent! p-0!"
      />
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
    <SfMdPreview
      v-if="(msg.requestStatus === 'success' || isGenerating) && !msg.contentCollapsed && content"
      :modelValue="content"
      :theme="theme"
      editorId="ai-preview"
      class="inline-block max-w-full min-w-0 overflow-hidden bg-transparent! p-0! align-bottom text-[14px] leading-relaxed text-sf-text"
      :class="{ 'typing-active': msg.typing }"
    />
    <!-- 操作区域 -->
    <nav
      v-if="msg.content && !msg.typing && resumeShow"
      class="mt-1 flex items-center gap-1 transition-opacity duration-300"
    >
      <SfTooltip content="复制">
        <button class="action-btn" @click="handleCopy(msg.content)">
          <SfIcon icon="ph:copy-duotone" size="3.5" />
        </button>
      </SfTooltip>
    </nav>
    <!-- 推荐问题 -->
    <div v-if="isLast && followQuestions.length" class="mt-1 flex w-full flex-col gap-2">
      <div
        v-for="(item, index) in followQuestions"
        :key="index"
        class="flex min-w-0 cursor-pointer items-center gap-2 rounded-3xl bg-sf-bg px-3 py-2 text-[13px] text-sf-text transition-all duration-200 hover:bg-sf-bg-2"
        @click="emit('sendFollowQuestion', item)"
      >
        <SfTooltip :content="item" class="min-w-0 flex-1">
          <span class="block truncate whitespace-nowrap">{{ item }}</span>
        </SfTooltip>
        <div class="flex shrink-0 items-center gap-1">
          <SfTooltip content="填入输入框">
            <button
              type="button"
              class="follow-question-action"
              @click.stop="handleFillFollowQuestion($event, item)"
            >
              <SfIcon icon="ph:chat-teardrop-dots-duotone" size="3.5" />
            </button>
          </SfTooltip>
          <SfTooltip content="发送">
            <button
              type="button"
              class="follow-question-action"
              @click.stop="emit('sendFollowQuestion', item)"
            >
              <SfIcon icon="mingcute:arrow-right-line" size="3.5" />
            </button>
          </SfTooltip>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
@reference "@/styles/tailwind.css";

/* 操作按钮公共样式 */
.action-btn {
  @apply flex h-7 w-7 items-center justify-center rounded-lg text-sf-text transition-colors hover:bg-sf-bg-3;
}
.follow-question-action {
  @apply flex h-6 w-6 items-center justify-center rounded-md text-sf-text transition-colors hover:bg-sf-bg-3;
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
