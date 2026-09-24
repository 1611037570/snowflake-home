<script setup>
// 标签选择：保留预设标签，回车添加自定义标签
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
const inputValue = ref("");

const options = computed(() => [
  ...props.list,
  ...tags.value.filter((tag) => !props.list.includes(tag)),
]);
const isActive = (tag) => tags.value.includes(tag);
const toggle = (tag) => {
  tags.value = isActive(tag) ? tags.value.filter((item) => item !== tag) : [...tags.value, tag];
};

// 输入标签后回车添加并选中
const addTag = () => {
  const value = inputValue.value.trim();
  if (value && !tags.value.includes(value)) {
    tags.value = [...tags.value, value];
  }
  inputValue.value = "";
};
</script>

<template>
  <div
    class="flex min-h-12 w-full flex-wrap items-center gap-3 rounded-3xl border border-sf-b px-3 py-3 transition-colors hover:border-sf-theme"
  >
    <div
      v-for="tag in options"
      :key="tag"
      class="flex-c h-6 cursor-pointer rounded-3xl border px-3 text-xs transition-colors"
      :class="
        isActive(tag)
          ? 'border-none border-sf-theme bg-sf-theme text-sf-theme-text hover:bg-sf-theme-2'
          : 'border-sf-border text-sf-text-2 hover:border-sf-theme hover:text-sf-theme'
      "
      @click="toggle(tag)"
    >
      {{ tag }}
    </div>
    <input
      v-model="inputValue"
      class="min-w-32 flex-1 bg-transparent text-sm text-sf-text outline-none placeholder:text-sf-text-3"
      placeholder="回车添加，再次点击标签可取消"
      @keydown.enter.prevent="addTag"
    />
  </div>
</template>
