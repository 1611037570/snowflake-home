<script setup>
// 标签选择：默认标签点选切换，最右侧支持自定义输入后确认新增
const props = defineProps({
  // 可选标签：由字段配置注入，组件自身不内置业务标签
  list: {
    type: Array,
    default: () => [],
  },
});
// 已选标签：字符串数组，随字段数据持久化
const tags = defineModel("modelValue", {
  type: Array,
  default: () => [],
});
// 自定义输入区是否展开
const editing = ref(false);
const custom = ref("");
const inputRef = useTemplateRef("inputRef");

// 标签池：默认标签在前，已选的自定义标签追加在后
const options = computed(() => [
  ...props.list,
  ...tags.value.filter((tag) => !props.list.includes(tag)),
]);
// 当前标签是否选中
const isActive = (tag) => tags.value.includes(tag);
// 点选标签：已选则移除，未选则追加
const toggle = (tag) => {
  tags.value = isActive(tag) ? tags.value.filter((item) => item !== tag) : [...tags.value, tag];
};
// 展开自定义输入并聚焦
const openCustom = async () => {
  editing.value = true;
  await nextTick();
  inputRef.value?.focus?.();
};
// 确认自定义标签：去重后追加并选中
const confirmCustom = () => {
  const value = custom.value.trim();
  if (value && !tags.value.includes(value)) {
    tags.value = [...tags.value, value];
  }
  custom.value = "";
  editing.value = false;
};
</script>

<template>
  <div class="flex w-full flex-wrap items-center gap-3">
    <!-- 标签池：点选切换选中状态，超出宽度自动换行 -->
    <span
      v-for="tag in options"
      :key="tag"
      class="cursor-pointer rounded-3xl border px-3 py-1 text-sm transition-colors"
      :class="
        isActive(tag)
          ? 'border-sf-theme bg-sf-theme text-sf-theme-text'
          : 'border-sf-border text-sf-text-2 hover:border-sf-theme hover:text-sf-theme'
      "
      @click="toggle(tag)"
    >
      {{ tag }}
    </span>
    <!-- 自定义入口：展开后为输入框与确认按钮 -->
    <template v-if="editing">
      <div class="w-36">
        <SfInput
          ref="inputRef"
          v-model="custom"
          size="small"
          placeholder="输入自定义标签"
          @keyup.enter="confirmCustom"
        />
      </div>
      <SfButton size="small" :disabled="!custom.trim()" @click="confirmCustom">确认</SfButton>
    </template>
    <span
      v-else
      class="cursor-pointer rounded-3xl border border-sf-border px-3 py-1 text-sm text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
      @click="openCustom"
    >
      自定义
    </span>
  </div>
</template>

<style lang="scss" scoped></style>
