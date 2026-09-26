<script setup>
import { computed } from "vue";

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
  return [...categories.values()];
});

// 级联控件按类别回显，简历数据只保存选中的名称。
const selected = computed({
  get: () => {
    if (!position.value) return [];
    const option = props.list.find((item) => item.value === position.value);
    return option ? [option.group, option.value] : [position.value];
  },
  set: (values) => {
    position.value = values?.length ? String(values[values.length - 1]) : "";
  },
});

</script>

<template>
  <SfCascader
    v-model="selected"
    :options="positionCategories"
    filterable
    clearable
    class="w-full"
    :placeholder="placeholder || $t('positionPlaceholder')"
  />
</template>
