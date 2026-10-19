<script setup>
import { computed } from "vue";
import i18n, { $t } from "@/locales";

defineOptions({ name: "PositionPicker" });

// 下拉首行提示的标识值：禁用态不可选中，仅用于承载提示文案
const INPUT_HINT_VALUE = "__dropdown_input_hint__";

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
  // 读取当前语言建立依赖，首行提示文案随语言切换更新
  i18n.global.locale.value;
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
  // 支持自行输入：面板首行固定一条提示，告知预置岗位之外还能输入自定义值（禁用态不可选中）
  return [
    { value: INPUT_HINT_VALUE, label: $t("dropdownInputHint"), disabled: true },
    ...[...categories.values()],
  ];
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
