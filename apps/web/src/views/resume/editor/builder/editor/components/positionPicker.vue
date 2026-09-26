<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

defineOptions({ name: "PositionPicker" });

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "",
  },
});

const position = defineModel("modelValue", {
  type: String,
  default: "",
});
const pickerRef = ref();
const searchText = ref("");
const searchInputRef = ref();

const hasPositionMatch = (value) => {
  const query = String(value ?? searchText.value).trim().toLowerCase();
  if (!query) return true;
  return props.list.some((item) =>
    [item.category, item.name].some((text) => String(text).toLowerCase().includes(query)),
  );
};

const positionCategories = computed(() => {
  const categories = new Map();
  props.list.forEach((item) => {
    if (!categories.has(item.group)) {
      categories.set(item.group, {
        value: item.group,
        label: item.category,
        children: [],
      });
    }
    categories.get(item.group).children.push({
      value: item.value,
      label: item.name,
    });
  });
  const customPositions = [];
  if (position.value && !props.list.some((item) => item.value === position.value)) {
    customPositions.push(position.value);
  }
  const query = searchText.value.trim();
  if (query && !hasPositionMatch(query) && !customPositions.includes(query)) {
    customPositions.push(query);
  }
  if (customPositions.length) {
    categories.set("customPosition", {
      value: "customPosition",
      label: $t("customPositionCategory"),
      children: customPositions.map((value) => ({ value, label: value })),
    });
  }
  return [...categories.values()];
});

// 级联控件按类别回显，简历数据只保存选中的岗位名称。
const selected = computed({
  get: () => {
    if (!position.value) return [];
    const option = props.list.find((item) => item.value === position.value);
    return option ? [option.group, option.value] : ["customPosition", position.value];
  },
  set: (values) => {
    position.value = values?.length ? String(values[values.length - 1]) : "";
  },
});

const handleSearchInput = (event) => {
  searchText.value = String(event.currentTarget?.value ?? "");
};

// 直接同步级联输入框的搜索词，驱动未匹配的自定义选项实时更新。
const attachSearchInput = () => {
  const input = pickerRef.value?.querySelector?.("input.el-input__inner");
  if (!input || input === searchInputRef.value) return;
  searchInputRef.value?.removeEventListener("input", handleSearchInput);
  searchInputRef.value = input;
  input.addEventListener("input", handleSearchInput);
};

onMounted(() => nextTick(attachSearchInput));
onBeforeUnmount(() => searchInputRef.value?.removeEventListener("input", handleSearchInput));

const handleVisibleChange = (visible) => {
  if (!visible) searchText.value = "";
};

</script>

<template>
  <div ref="pickerRef" class="w-full">
    <SfCascader
      v-model="selected"
      :options="positionCategories"
      filterable
      clearable
      class="w-full"
      :placeholder="placeholder || $t('positionPlaceholder')"
      @visible-change="handleVisibleChange"
    />
  </div>
</template>
