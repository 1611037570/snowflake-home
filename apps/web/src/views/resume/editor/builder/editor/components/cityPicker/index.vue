<script setup>
import { computed } from "vue";
import { ElCascader } from "element-plus";

const props = defineProps({
  // 省市级联选项：由业务域字典注入，组件自身不内置城市数据
  list: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "请选择城市",
  },
  clearable: {
    type: Boolean,
    default: true,
  },
});

// 表单仅保存最后选中的城市名，省份分组由注入的级联选项提供，不写入简历 JSON
const city = defineModel("modelValue", {
  type: String,
  default: "",
});

// 回显时按城市名反查所在省份
const selected = computed({
  get: () => {
    if (!city.value) return [];
    const province = props.list.find((item) =>
      item.children
        ? item.children.some((child) => child.value === city.value)
        : item.value === city.value,
    );
    if (!province) return [];
    return province.children ? [province.value, city.value] : [province.value];
  },
  set: (values) => {
    // 清空选择时级联组件可能回传空值
    city.value = values?.length ? String(values[values.length - 1]) : "";
  },
});
</script>

<template>
  <SfCascader
    v-model="selected"
    :options="list"
    filterable
    class="w-full"
    :placeholder="placeholder"
    :clearable="clearable"
  />
</template>

<style lang="scss" scoped>
:deep(.el-input__wrapper) {
  box-shadow: none;
}
</style>
