<script setup>
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
  {{ msg }}
  <!-- 消息主体 -->
  <article class="group flex w-full min-w-0 flex-col items-end gap-1.5 transition-all duration-300">
    <!-- 用户名与时间 -->
    <header
      class="flex w-full flex-row-reverse items-center justify-between gap-3 px-1 select-none"
    >
      <div class="flex flex-row-reverse items-center gap-3">
        <!-- 唯一头像 Icon (进一步调大) -->
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-sf-theme/20 via-sf-theme/10 to-sf-theme/20 text-sf-theme shadow-md ring-1 ring-sf-theme/10 transition-transform hover:-rotate-12"
        >
          <SfIcon icon="ph:user-duotone" size="6" />
        </div>
        <div class="flex flex-col items-end gap-0.5 leading-tight">
          <span class="text-[15px] font-black tracking-wider text-sf-text">我</span>
          <div class="flex flex-row-reverse items-center gap-2">
            <time v-if="msg.time" class="text-[11px] font-bold tabular-nums opacity-40">{{
              msg.time
            }}</time>
          </div>
        </div>

        <!-- 我的消息切换 (美化后的胶囊风格) -->
        <button
          v-if="msg.content"
          class="flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all hover:shadow-xs active:scale-95"
          :class="
            !msg.contentCollapsed
              ? 'border-sf-theme/20 bg-sf-theme/10 text-sf-theme'
              : 'border-sf-border/10 bg-sf-bg-3 text-sf-text-3 hover:border-sf-border/30 hover:text-sf-text'
          "
          @click="emit('updateCollapsedStatus', index, 'content')"
        >
          <SfIcon
            icon="ph:user-duotone"
            size="3"
            class="transition-colors"
            :class="!msg.contentCollapsed ? 'text-sf-theme' : 'text-sf-text-3'"
          />
          <span class="tracking-tight">我的消息</span>
          <SfIcon
            icon="ph:caret-down-bold"
            size="2"
            class="opacity-40 transition-transform duration-300"
            :class="{ '-rotate-180 opacity-80': !msg.contentCollapsed }"
          />
        </button>
      </div>
    </header>

    <!-- 消息内容区域 (对齐位置同步调整) -->
    <div class="flex w-full flex-col items-end gap-1.5 pr-13 pl-1">
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
      <nav
        v-if="msg.content"
        class="flex items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <SfTooltip content="撤回并重新编辑">
          <button class="action-btn" @click="emit('recall', index, 'content')">
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
