<script setup>
import { useAiStore } from "@/stores";

const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["select"]);

const aiStore = useAiStore();

function createNewChat() {
  aiStore.createNewResumeAssistantChat();
}

// 导航文本：展示正文摘要，空内容回退为状态文案
function getMessageBrief(msg) {
  const content = msg.content;
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
  <div class="p-3">
    <div
      class="flex h-[36px] w-full justify-between rounded-3xl border border-sf-b bg-sf-page p-1.5"
    >
      <div class="flex items-center gap-1">
        <!-- 消息导航：悬停展开用户消息，点击滚动定位 -->
        <div v-if="props.messages.length" class="group/nav relative flex items-center">
          <SfTooltip content="消息导航">
            <div
              class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-sf-text-2 transition-colors hover:bg-sf-theme-2 hover:text-sf-theme-text"
            >
              <SfIcon icon="ph:list-duotone" size="4" />
            </div>
          </SfTooltip>
          <div
            class="invisible absolute top-7 right-0 z-10 opacity-0 transition-all duration-300 group-hover/nav:visible group-hover/nav:opacity-100"
          >
            <div class="flex w-60 flex-col overflow-hidden rounded-3xl border border-sf-b bg-sf-primary shadow-lg">
              <div class="max-h-80 overflow-y-auto px-3 pb-3">
                <button
                  v-for="(msg, index) in props.messages"
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
        <SfTooltip content="新建话题">
          <SfIcon
            @click="createNewChat"
            icon="ph:plus-bold"
            size="4"
            boxSize="6"
            class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
          />
        </SfTooltip>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
