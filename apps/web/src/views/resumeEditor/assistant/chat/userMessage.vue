<script setup>
import ToggleButton from "./toggleButton.vue";

defineProps({
  msg: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["recall", "updateCollapsedStatus"]);
</script>

<template>
  <!-- 消息主体 -->
  <article class="group flex w-full min-w-0 flex-col items-end gap-1.5 transition-all duration-300">
    <!-- 用户名与时间 -->
    <header class="flex w-full items-center justify-end gap-1 px-1 select-none">
      <!-- 我的消息切换 (美化后的胶囊风格) -->
      <ToggleButton
        v-if="msg.content"
        label="我的消息"
        :collapsed="msg.contentCollapsed"
        gap="gap-1"
        @toggle="emit('updateCollapsedStatus', index, 'content')"
      />
      <div class="flex flex-col items-end gap-0.5 leading-tight">
        <span class="text-[12px] font-black tracking-wider text-sf-text">我</span>
      </div>
    </header>

    <!-- 消息内容区域 (对齐位置同步调整) -->
    <div class="flex w-full flex-col items-end gap-1 pl-1">
      <!-- 消息内容 -->
      <template v-if="!msg.contentCollapsed">
        <!-- 用户消息气泡 -->
        <div
          class="max-w-full min-w-0 overflow-hidden text-[14px] leading-relaxed whitespace-pre-wrap transition-all"
        >
          {{ msg.content }}
        </div>
      </template>

      <!-- 用户操作 -->
      <nav v-if="msg.content" class="flex items-center transition-opacity duration-300">
        <SfTooltip content="撤回并重新编辑">
          <button class="action-btn" @click="emit('recall', msg)">
            <SfIcon icon="ph:arrow-u-up-left-duotone" size="3.5" />
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
  @apply flex h-7 w-7 items-center justify-center rounded-lg text-sf-text-3 transition-colors hover:bg-sf-bg-3 hover:text-sf-theme;
}
</style>
