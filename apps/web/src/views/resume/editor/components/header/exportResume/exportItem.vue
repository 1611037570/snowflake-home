<script setup>
defineProps({
  // 导出格式及其切换选项
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["click"]);
</script>

<template>
  <div
    class="group flex min-w-0 cursor-pointer flex-col justify-center gap-3 rounded-3xl border border-sf-b bg-sf-bg p-3 transition-colors duration-200 hover:border-sf-theme"
    role="button"
    tabindex="0"
    :aria-label="item.name"
    @click="emit('click')"
    @keydown.enter.self.prevent="emit('click')"
    @keydown.space.self.prevent="emit('click')"
  >
    <div class="flex w-full min-w-0 items-center gap-3">
      <div
        class="flex h-15 w-12 shrink-0 -rotate-6 items-center justify-center rounded-2xl border border-sf-b shadow-sm transition-transform duration-200 group-hover:rotate-0"
        :class="item.iconClass"
      >
        <SfIcon :icon="item.icon" size="8" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="text-base font-semibold text-sf-text">{{ item.name }}</div>
        <div class="mt-3 text-[13px] leading-6 text-sf-text-3">{{ item.desc }}</div>
      </div>
      <SfIcon
        icon="mingcute:right-line"
        size="4"
        class="shrink-0 text-sf-text-3 transition-transform group-hover:translate-x-1 group-hover:text-sf-theme"
      />
    </div>
    <!-- 复合导出项在卡片内切换导出来源或文件类型。 -->
    <div v-if="item.options?.length" class="flex w-full gap-3 border-t border-sf-b pt-3" @click.stop>
      <SfButton
        v-for="option in item.options"
        :key="option.value"
        class="min-w-0 flex-1"
        size="small"
        border
        :disabled="option.disabled"
        :type="item.modelValue === option.value ? 'theme' : 'bg'"
        @click.stop="item.onChange(option.value)"
      >
        {{ option.name }}
      </SfButton>
    </div>
    <!-- 补充说明（如云端禁用的原因），展示在选项下方。 -->
    <p v-if="item.note" class="text-xs leading-6 text-sf-text-3">{{ item.note }}</p>
  </div>
</template>

<style lang="scss" scoped>
/* 从主题配色生成柔和紫色，背景浓度与其他文件图标一致。 */
.export-markdown-icon {
  --export-markdown-color: color-mix(in oklch, var(--sf-theme), var(--sf-error));
  color: var(--export-markdown-color);
  background-color: color-mix(in oklab, var(--export-markdown-color) 15%, transparent);
}
</style>
