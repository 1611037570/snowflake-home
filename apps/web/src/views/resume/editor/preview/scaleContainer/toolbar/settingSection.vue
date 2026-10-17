<script setup>
import { useSlots } from "vue";

defineProps({
  title: { type: String, required: true }, // 当前设置分组标题
  resetLabel: { type: String, required: true }, // 分组重置按钮的无障碍说明
});

defineEmits(["reset"]);

// 仅在标题右侧存在扩展内容时撑满标题栏，普通分组继续保持紧凑宽度。
const slots = useSlots();
</script>

<template>
  <section class="flex flex-col gap-1">
    <header class="flex items-center gap-3" :class="slots.right ? 'w-full justify-between' : 'w-fit'">
      <!-- 标题底色仅包裹左侧标题与重置入口，右侧扩展内容保持独立。 -->
      <span class="flex h-6 items-center gap-3 rounded-xl bg-sf-bg px-3">
        <span class="text-sm font-bold text-sf-text">{{ title }}</span>
        <button
          type="button"
          class="flex cursor-pointer items-center text-xs text-sf-text-2 transition-colors hover:text-sf-theme"
          :aria-label="resetLabel"
          :title="resetLabel"
          @click="$emit('reset')"
        >
          <SfIcon icon="material-symbols:restart-alt" size="4" />
        </button>
      </span>
      <slot name="right" />
    </header>
    <slot />
  </section>
</template>
