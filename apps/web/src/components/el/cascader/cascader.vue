<template>
  <div ref="wrapperRef" class="w-full">
    <Component
      v-model="value"
      :is="h(ElCascader, { ...$attrs, options: cascaderOptions, onVisibleChange: handleVisibleChange, ref: changeRef }, $slots)"
      class="w-full rounded-3xl border-none text-sf-text"
      :class="bg"
    />
  </div>
</template>

<script setup lang="ts">
import { ElCascader } from "element-plus";
// 级联面板样式与输入框分离，按需引入面板样式
import "element-plus/theme-chalk/el-cascader-panel.css";
import type { ComponentInstance } from "vue";
import { computed, getCurrentInstance, h, nextTick, onBeforeUnmount, onMounted, ref, useAttrs } from "vue";

defineOptions({ name: "SfCascader" });

const props = defineProps({
  allowCreate: { type: Boolean, default: true },
});

const bg = inject("bg");
const attrs = useAttrs();
const wrapperRef = ref<HTMLElement>();
const searchInputRef = ref<HTMLInputElement>();
const searchText = ref("");

const vm: any = getCurrentInstance();
const value = defineModel("modelValue");

const cascaderOptions = computed(() => {
  const options = (attrs.options as Record<string, any>[] | undefined) ?? [];
  const optionProps = (attrs.props as Record<string, string> | undefined) ?? {};
  const childrenKey = optionProps.children ?? "children";
  const labelKey = optionProps.label ?? "label";
  const valueKey = optionProps.value ?? "value";
  const separator = String(attrs.separator ?? " / ");
  const query = searchText.value.trim();
  const optionValues = new Set<unknown>();
  let hasMatch = false;

  const inspect = (nodes: Record<string, any>[], parentLabels: string[] = []) => {
    nodes.forEach((option) => {
      const label = String(option[labelKey] ?? "");
      const path = [...parentLabels, label].join(separator).toLowerCase();
      optionValues.add(option[valueKey]);
      if (query && path.includes(query.toLowerCase())) hasMatch = true;
      const children = option[childrenKey];
      if (Array.isArray(children)) inspect(children, [...parentLabels, label]);
    });
  };

  inspect(options);
  const generatedOptions: Record<string, any>[] = [];
  const addRootOption = (optionValue: unknown) => {
    if (optionValue == null || optionValue === "" || optionValues.has(optionValue)) return;
    if (generatedOptions.some((option) => option[valueKey] === optionValue)) return;
    generatedOptions.push({ [valueKey]: optionValue, [labelKey]: String(optionValue) });
  };
  const selectedValue = Array.isArray(value.value) ? value.value.at(-1) : value.value;

  addRootOption(selectedValue);
  if (props.allowCreate && query && !hasMatch) addRootOption(query);

  return generatedOptions.length ? [...options, ...generatedOptions] : options;
});

const handleSearchInput = (event: Event) => {
  searchText.value = String((event.currentTarget as HTMLInputElement | null)?.value ?? "");
};

// 通用级联组件根据实时搜索词生成未匹配的一级选项。
const attachSearchInput = () => {
  const input = wrapperRef.value?.querySelector<HTMLInputElement>("input.el-input__inner");
  if (!input || input === searchInputRef.value) return;
  searchInputRef.value?.removeEventListener("input", handleSearchInput);
  searchInputRef.value = input;
  input.addEventListener("input", handleSearchInput);
};

const handleVisibleChange = (visible: boolean) => {
  if (!visible) searchText.value = "";
  const listener = attrs.onVisibleChange;
  if (typeof listener === "function") listener(visible);
  else if (Array.isArray(listener)) listener.forEach((callback) => callback(visible));
};

function changeRef(exports: any) {
  vm.exposed = exports;
}

onMounted(() => nextTick(attachSearchInput));
onBeforeUnmount(() => searchInputRef.value?.removeEventListener("input", handleSearchInput));

defineExpose({} as ComponentInstance<typeof ElCascader>);
</script>

<style scoped lang="scss">
/* 输入框容器 */
:deep(.el-input__wrapper) {
  /* 移除阴影 */
  box-shadow: none;
  /* 移除背景 */
  background-color: transparent;
}

/* 输入框文本 */
:deep(.el-input__inner) {
  /* 更改文本颜色 */
  color: var(--color-sf-text);
}
:global(.el-cascader-menu .el-cascader-node) {
  border-radius: 24px !important;
  margin: 0 12px !important;
}
</style>
