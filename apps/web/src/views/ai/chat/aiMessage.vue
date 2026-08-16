<script setup>
import { useThemeStore } from "@/stores";
import { useClipboard } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/preview.css";
import { storeToRefs } from "pinia";

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
const currentType = inject("type");

const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);
const { copy, isSupported } = useClipboard();

const emit = defineEmits(["updateCollapsedStatus"]);

const handleCopy = async (text) => {
  if (!isSupported.value) {
    ElMessage.error("当前浏览器不支持复制");
    return;
  }
  await copy(text);
  ElMessage.success("复制成功");
};

// 操作按钮配置
const actionButtons = [
  {
    icon: "ph:copy-duotone",
    tooltip: "复制",
    onClick: () => handleCopy(props.msg.content),
  },
  { icon: "ph:arrows-clockwise-duotone", tooltip: "重新生成" },
];
const resumeContent = computed(() => {
  if (currentType !== "resume") {
    return "";
  }
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
  // 简历模式
  if (currentType === "resume") {
    // 返回分析结果
    return resumeContent.value.analysis;
  }
  // 普通模式
  return props.msg.content;
});
function a() {
  console.log("resumeContent.value:>> ", resumeContent.value);
}
const isResumeMode = computed(() => currentType === "resume");
const resumeShow = computed(() => {
  // 非简历模式
  if (!isResumeMode.value) {
    return true;
  }
  return (
    // 内容为对象
    typeof resumeContent.value === "object" &&
    // 请求状态为成功
    resumeContent.value.requestStatus === "success"
  );
});
</script>

<template>
  <!-- 消息主体 -->
  <div @click="a">1111</div>
  <article
    class="group flex w-full min-w-0 flex-col items-start gap-1.5 transition-all duration-300"
  >
    <!-- 用户名与时间 -->
    <header class="flex w-full flex-row items-center justify-between gap-1 px-1 select-none">
      <div class="flex items-center gap-1">
        <div class="flex flex-col gap-0.5 leading-tight">
          <span class="text-[12px] font-black tracking-wider text-sf-text">小羊</span>
          <div class="flex items-center gap-1">
            <time v-if="msg.time" class="text-[11px] font-bold tabular-nums opacity-40">{{
              msg.time
            }}</time>
          </div>
        </div>

        <!-- 思考过程切换 (美化后的胶囊风格) -->
        <button
          v-if="msg.thought && !isResumeMode"
          class="flex cursor-pointer items-center gap-1.5 rounded-full border px-2 py-0.5 text-sf font-bold transition-all"
          :class="
            !msg.thoughtCollapsed
              ? 'border-sf-theme/20 bg-sf-theme/10 text-sf-theme'
              : 'border-sf-border/10 bg-sf-bg-3 text-sf-text-3'
          "
          @click="emit('updateCollapsedStatus', index, 'thought')"
        >
          <span class="tracking-tight">{{ msg.content ? "已完成思考" : "思考中" }}</span>
          <SfIcon
            icon="ph:caret-down-bold"
            size="2"
            class="transition-transform duration-300"
            :class="{ '-rotate-180 opacity-80': !msg.thoughtCollapsed }"
          />
        </button>

        <!-- 回复内容切换 (美化后的胶囊风格) -->
        <button
          v-if="msg.content && resumeShow"
          class="flex cursor-pointer items-center gap-1.5 rounded-full border px-2 py-0.5 text-sf font-bold transition-all"
          :class="
            !msg.contentCollapsed
              ? 'border-sf-theme/20 bg-sf-theme/10 text-sf-theme'
              : 'border-sf-border/10 bg-sf-bg-3 text-sf-text-3'
          "
          @click="emit('updateCollapsedStatus', index, 'content')"
        >
          <span class="tracking-tight">回复内容</span>
          <SfIcon
            icon="ph:caret-down-bold"
            size="2"
            class="transition-transform duration-300"
            :class="{ '-rotate-180 opacity-80': !msg.contentCollapsed }"
          />
        </button>
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
      <!-- AI Loading 状态 (当既没有思考内容也没有回复内容时显示) -->
      <div
        v-if="(!msg.thought && !msg.content) || resumeShow"
        class="flex h-10 w-[120px] items-center justify-center gap-1.5"
      >
        加载中
        <span
          v-for="i in 3"
          :key="i"
          class="h-1.5 w-1.5 animate-bounce rounded-full bg-sf-theme opacity-80"
          :style="`animation-delay: ${(i - 1) * 150}ms`"
        ></span>
      </div>

      <!-- AI 思考过程内容 (折叠部分) -->
      <template v-if="msg.thought && !msg.thoughtCollapsed && currentType !== 'resume'">
        <div
          class="relative border border-sf-border/10 px-4 text-[13.5px] leading-relaxed text-sf-text-3/90"
        >
          <div class="absolute top-0 left-0 h-full w-1 bg-sf-theme/20"></div>
          <MdPreview
            :modelValue="msg.thought"
            :theme="theme"
            editorId="thought-preview"
            class="bg-transparent! p-0! italic"
          />
          <div class="mt-3" v-if="msg.content">已完成</div>
        </div>
      </template>

      <!-- 正式回复内容 -->
      <template
        v-if="currentType === 'resume' ? msg.requestStatus === 'success' : !msg.contentCollapsed"
      >
        <!-- AI 消息 (Markdown 渲染) -->
        <div class="relative w-full min-w-0">
          <MdPreview
            v-if="content"
            :modelValue="content"
            :theme="theme"
            editorId="ai-preview"
            class="inline-block max-w-full min-w-0 overflow-hidden bg-transparent! p-0! align-bottom text-[14px] leading-relaxed text-sf-text"
            :class="{ 'typing-active': msg.typing }"
          />
          <div v-if="currentType === 'resume'" class="mt-2 flex flex-col gap-2">
            <div
              v-for="(item, index) in resumeContent.followQuestions"
              :key="index"
              class="cursor-pointer rounded-lg border border-sf-border bg-sf-bg-2 px-3 py-2 text-[13px] text-sf-text transition-all duration-200 hover:border-sf-theme hover:bg-sf-bg-hover"
            >
              {{ item }}
            </div>
          </div>
        </div>
      </template>
      <div v-else></div>

      <!-- AI 操作区域 -->
      <nav
        v-if="msg.content && !msg.typing && resumeShow"
        class="flex items-center gap-1 transition-opacity duration-300"
      >
        <template v-for="(btn, idx) in actionButtons" :key="idx">
          <SfTooltip :content="btn.tooltip">
            <button class="action-btn" @click="btn.onClick?.()">
              <SfIcon :icon="btn.icon" size="3.5" />
            </button>
          </SfTooltip>
        </template>
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
