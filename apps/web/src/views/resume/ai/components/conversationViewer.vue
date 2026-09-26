<script setup lang="ts">
import { useAiStore, useResumeStore, type Chat } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
import { getResumeTitle } from "../../editor/resumeName";

const aiStore = useAiStore();
const resumeStore = useResumeStore();
const { resumeList, list } = storeToRefs(resumeStore);
const activeChatId = ref("");
const activeChat = ref<Chat | null>(null);
const resumeAssistantChatList = computed(() =>
  list.value.flatMap((resume) => resume.ai.map((chat) => ({ ...chat, resumeId: resume.id }))),
);

// 对话记录更新后优先保留当前选择，首次进入默认展示最新一条。
watch(
  resumeAssistantChatList,
  async (chatList) => {
    if (!chatList.some((chat) => chat.id === activeChatId.value)) {
      activeChatId.value = chatList[0]?.id || "";
    }
    const id = activeChatId.value;
    const loaded = id ? await aiStore.getResumeAssistantChat(id) : null;
    if (activeChatId.value === id) activeChat.value = loaded || null;
  },
  { immediate: true },
);

const messages = computed(
  () => activeChat.value?.messages.filter((message) => message.role !== "system") || [],
);
const resumeTitles = computed(
  () =>
    new Map(
      [...resumeList.value, ...resumeStore.trashList].map((item) => [item.id, getResumeTitle(item)]),
    ),
);

function getChatResumeTitle(chat: Pick<Chat, "resumeId">) {
  if (!chat.resumeId) return "未关联简历";
  return resumeTitles.value.get(chat.resumeId) || "已删除简历";
}

async function selectChat(id: string) {
  activeChatId.value = id;
  const loaded = await aiStore.getResumeAssistantChat(id);
  if (activeChatId.value === id) activeChat.value = loaded || null;
}

function formatTime(time: number) {
  return new Date(time).toLocaleString();
}
</script>

<template>
  <div class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-sf-b bg-sf-primary md:flex-row">
    <aside class="flex h-36 shrink-0 flex-col border-b border-sf-b md:h-full md:w-60 md:border-r md:border-b-0">
      <div class="shrink-0 border-b border-sf-b px-3 py-3">
        <h2 class="font-bold text-sf-text">消息</h2>
      </div>
      <SfScrollbar class="min-h-0 flex-1 p-3">
        <div v-if="resumeAssistantChatList.length" class="flex flex-col gap-3">
          <button
            v-for="chat in resumeAssistantChatList"
            :key="chat.id"
            class="w-full cursor-pointer rounded-xl px-3 py-3 text-left transition-colors"
            :class="
              activeChatId === chat.id
                ? 'bg-sf-theme-3 text-sf-theme'
                : 'text-sf-text hover:bg-sf-bg'
            "
            type="button"
            @click="selectChat(chat.id)"
          >
            <strong class="block truncate text-sm">{{ chat.title }}</strong>
            <small class="mt-3 block truncate text-xs text-sf-text-3">
              {{ getChatResumeTitle(chat) }}
            </small>
            <small class="mt-3 block text-xs text-sf-text-3">{{
              formatTime(chat.updateTime)
            }}</small>
          </button>
        </div>
        <div v-else class="flex h-full items-center justify-center text-sm text-sf-text-3">
          暂无对话记录
        </div>
      </SfScrollbar>
    </aside>

    <section class="flex min-w-0 flex-1 flex-col">
      <header class="shrink-0 border-b border-sf-b px-3 py-3 sm:px-6">
        <h3 class="truncate font-bold text-sf-text">{{ activeChat?.title || "消息" }}</h3>
      </header>
      <SfScrollbar class="min-h-0 flex-1">
        <div v-if="messages.length" class="mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-6">
          <article
            v-for="(message, index) in messages"
            :key="`${message.createTime}-${index}`"
            class="flex flex-col gap-3"
            :class="message.role === 'user' ? 'items-end' : 'items-start'"
          >
            <span class="text-xs font-bold text-sf-text-3">
              {{ message.role === "user" ? "我" : "小舟AI" }}
            </span>
            <div
              class="max-w-full rounded-2xl px-3 py-3 text-sm leading-7"
              :class="
                message.role === 'user' ? 'bg-sf-theme-3 text-sf-text' : 'bg-sf-bg text-sf-text'
              "
            >
              <p v-if="message.role === 'user'" class="whitespace-pre-wrap">
                {{ message.content }}
              </p>
              <SfMdPreview
                v-else-if="message.content"
                :modelValue="message.content"
                :editorId="`resume-ai-message-${index}`"
                class="bg-transparent! p-0!"
              />
              <span v-else class="text-sf-text-3">正在生成</span>
            </div>
          </article>
        </div>
        <div v-else class="flex h-full items-center justify-center text-sm text-sf-text-3">
          暂无消息内容
        </div>
      </SfScrollbar>
    </section>
  </div>
</template>
