<script setup>
defineProps({
  messages: {
    type: Array,
    required: true,
  },
});
const emit = defineEmits(["select"]);

// 导航摘要：提取单条消息文本，结构化回复优先展示分析文案
function getMessageBrief(msg) {
  const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content ?? "");
  try {
    const parsed = JSON.parse(content);
    if (parsed?.analysis) return String(parsed.analysis);
  } catch {}
  return content.replace(/\s+/g, " ").trim();
}
// 加载中与失败消息的状态文案
function getMessageStateLabel(msg) {
  if (msg.requestStatus === "error") return "生成失败";
  if (msg.typing && msg.requestStatus === "thinking") return "思考中";
  if (msg.typing && msg.requestStatus === "generating") return "回复中";
  if (msg.typing) return "生成中";
  return "";
}
</script>

<template>
  <!-- 悬停展开的消息导航 -->
  <div class="group/nav absolute top-1/2 left-0 z-9991 -translate-y-1/2">
    <!-- 折叠手柄 -->
    <div
      class="flex h-24 w-6 cursor-pointer items-center justify-center rounded-r-3xl border border-sf-b bg-sf-page text-sf-text-3 shadow-md transition-colors duration-300 group-hover/nav:bg-sf-theme group-hover/nav:text-sf-theme-text"
    >
      <SfIcon icon="ph:list-duotone" size="4" />
    </div>
    <!-- 展开面板 -->
    <div
      class="invisible absolute top-1/2 left-6 -translate-x-3 -translate-y-1/2 opacity-0 transition-all duration-300 group-hover/nav:visible group-hover/nav:translate-x-0 group-hover/nav:opacity-100"
    >
      <div
        class="flex w-60 flex-col overflow-hidden rounded-r-3xl border border-sf-b bg-sf-primary shadow-lg"
      >
        <div
          class="flex items-center justify-between border-b border-sf-b px-3 py-3 text-xs font-bold text-sf-text"
        >
          <span>消息导航</span>
          <span class="rounded-full bg-sf-bg px-3 text-[10px] leading-6 text-sf-text-2">
            {{ messages.length }}
          </span>
        </div>
        <div class="max-h-96 overflow-y-auto p-3">
          <button
            v-for="(msg, index) in messages"
            :key="index"
            type="button"
            class="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-sf-bg"
            @click="emit('select', index)"
          >
            <span
              class="flex h-6 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
              :class="
                msg.role === 'user' ? 'bg-sf-theme-3 text-sf-theme' : 'bg-sf-bg text-sf-text-2'
              "
            >
              {{ msg.role === "user" ? "我" : "AI" }}
            </span>
            <span class="min-w-0 flex-1 truncate text-xs text-sf-text-2">
              {{ getMessageBrief(msg) }}
            </span>
            <span v-if="getMessageStateLabel(msg)" class="shrink-0 text-[10px] text-sf-text-3">
              {{ getMessageStateLabel(msg) }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
