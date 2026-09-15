<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["click"]);
</script>

<template>
  <div
    class="group flex min-w-0 cursor-pointer flex-col gap-3 rounded-3xl border border-sf-b p-3 transition-colors hover:border-sf-theme hover:bg-sf-theme-2"
    @click="emit('click')"
  >
    <div class="flex w-full min-w-0 items-center gap-3">
      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sf-theme-2 text-sf-theme">
        <SfIcon :icon="item.icon" size="6" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="truncate text-base font-bold">{{ item.name }}</div>
        <div class="mt-3 text-sm text-sf-text-2">{{ item.desc }}</div>
      </div>
      <SfIcon
        icon="mingcute:right-line"
        size="4"
        class="shrink-0 text-sf-text-3 transition-transform group-hover:translate-x-1 group-hover:text-sf-theme"
      />
    </div>
    <!-- 复合导出项在卡片内切换导出来源或文件类型。 -->
    <div v-if="item.options?.length" class="flex w-full gap-3" @click.stop>
      <SfButton
        v-for="option in item.options"
        :key="option.value"
        class="min-w-0 flex-1"
        size="small"
        border
        :type="item.modelValue === option.value ? 'theme' : 'bg'"
        @click.stop="item.onChange(option.value)"
      >
        {{ option.name }}
      </SfButton>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
