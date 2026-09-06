<script setup>
import { computed } from "vue";
import { ElCascader } from "element-plus";

import cityData from "./cityData.json";

defineProps({
  placeholder: {
    type: String,
    default: "请选择城市",
  },
  clearable: {
    type: Boolean,
    default: true,
  },
});

// 表单仅保存最后选中的城市名，省份分组与城市数据内置在组件内，不写入简历 JSON
const city = defineModel("modelValue", {
  type: String,
  default: "",
});

// 级联选项：直辖市自身即为城市可直接选中，其余省份展开城市
const cascaderOptions = computed(() =>
  cityData.map((province) => {
    const isDirectCity = province.cities.length === 1 && province.cities[0] === province.label;
    return {
      value: province.label,
      label: province.label,
      children: isDirectCity
        ? undefined
        : province.cities.map((name) => ({ value: name, label: name })),
    };
  }),
);

// 回显时按城市名反查所在省份
const selected = computed({
  get: () => {
    if (!city.value) return [];
    const province = cascaderOptions.value.find((item) =>
      item.children
        ? item.children.some((child) => child.value === city.value)
        : item.value === city.value,
    );
    if (!province) return [];
    return province.children ? [province.value, city.value] : [province.value];
  },
  set: (values) => {
    city.value = values.length ? String(values[values.length - 1]) : "";
  },
});
</script>

<template>
  <SfCascader
    v-model="selected"
    :options="cascaderOptions"
    filterable
    class="w-full"
    :placeholder="placeholder"
    :clearable="clearable"
  />
</template>

<style lang="scss" scoped>
:deep(.el-input__wrapper) {
  box-shadow: none;
  background-color: red !important;
}
</style>
