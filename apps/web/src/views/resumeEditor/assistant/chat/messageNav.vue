<script setup>
defineProps({
  messages: {
    type: Array,
    required: true,
  },
});
const emit = defineEmits(["select"]);

// 导航文本：展示正文摘要，空内容回退为状态文案
function getMessageBrief(msg) {
  const content = typeof msg.content === "string" ? msg.content : "";
  const brief = content.replace(/\s+/g, " ").trim();
  if (brief) return brief;
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
      class="flex h-14 w-5 cursor-pointer items-center justify-center rounded-3xl border border-sf-b bg-sf-page text-sf-text-3 transition-colors duration-300 group-hover/nav:bg-sf-theme group-hover/nav:text-sf-theme-text"
    >
      <SfIcon icon="ph:list-duotone" size="4" />
    </div>
    <!-- 展开面板 -->
    <div
      class="invisible absolute top-1/2 left-4 -translate-x-3 -translate-y-1/2 opacity-0 transition-all duration-300 group-hover/nav:visible group-hover/nav:translate-x-0 group-hover/nav:opacity-100"
    >
      <div class="flex w-60 flex-col overflow-hidden rounded-3xl border border-sf-b bg-sf-primary">
        <div class="max-h-96 overflow-y-auto px-3 pb-3">
          <button
            v-for="(msg, index) in messages"
            :key="index"
            type="button"
            class="block w-full min-w-0 truncate py-3 text-left text-xs text-sf-text-2 transition-colors hover:text-sf-theme"
            @click="emit('select', msg)"
          >
            {{ getMessageBrief(msg) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
