<script setup>
import { computed } from "vue";
import { ElCascader } from "element-plus";
import i18n, { $t } from "@/locales";

// 下拉首行提示的标识值：禁用态不可选中，仅用于承载提示文案
const INPUT_HINT_VALUE = "__dropdown_input_hint__";

const props = defineProps({
  // 省市级联选项：由业务域字典注入，组件自身不内置城市数据
  list: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "",
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

// 支持自行输入：面板首行固定一条提示，告知预置城市之外还能输入自定义值（禁用态不可选中）
const cityOptions = computed(() => {
  // 读取当前语言建立依赖，提示文案随语言切换更新
  i18n.global.locale.value;
  return [{ value: INPUT_HINT_VALUE, label: $t("dropdownInputHint"), disabled: true }, ...props.list];
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
    if (!province) return [city.value];
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
    :options="cityOptions"
    filterable
    class="w-full"
    :placeholder="placeholder || $t('cityPlaceholder')"
    :clearable="clearable"
  />
</template>

<style lang="scss" scoped>
:deep(.el-input__wrapper) {
  box-shadow: none;
}
</style>
