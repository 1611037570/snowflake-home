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
    class="group flex min-w-0 cursor-pointer flex-col gap-3 rounded-xl border border-sf-b bg-sf-bg p-3 transition-colors duration-200 hover:border-sf-theme"
    role="button"
    tabindex="0"
    :aria-label="item.name"
    @click="emit('click')"
    @keydown.enter.self.prevent="emit('click')"
    @keydown.space.self.prevent="emit('click')"
  >
    <div class="flex w-full min-w-0 items-start gap-3">
      <!-- 统一图标底座尺寸，移除倾斜与悬停位移。 -->
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        :class="item.iconClass"
      >
        <SfIcon :icon="item.icon" size="6" />
      </div>
      <div class="min-w-0 flex-1">
        <!-- 格式切换保持与名称同行，选中态使用中性描边和底色。 -->
        <div class="flex items-center gap-3">
          <div class="shrink-0 text-sm font-medium leading-6 text-sf-text">{{ item.name }}</div>
          <div v-if="item.options?.length" class="flex items-center gap-3" @click.stop>
            <SfButton
              v-for="option in item.options"
              :key="option.value"
              class="shrink-0"
              size="small"
              border
              :disabled="option.disabled"
              type="bg"
              :class="item.modelValue === option.value ? 'border-sf-text-3! bg-sf-primary! text-sf-text!' : 'text-sf-text-3!'"
              :aria-pressed="item.modelValue === option.value"
              @click.stop="item.onChange(option.value)"
            >
              {{ option.name }}
            </SfButton>
          </div>
        </div>
        <div class="text-xs leading-6 text-sf-text-3">{{ item.desc }}</div>
      </div>
      <SfIcon
        icon="mingcute:right-line"
        size="4"
        class="shrink-0 self-center text-sf-text-3 transition-colors group-hover:text-sf-theme"
      />
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
