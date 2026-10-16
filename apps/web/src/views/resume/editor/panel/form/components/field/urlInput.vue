<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { $t } from "@/locales";

const modelValue = defineModel<string>("modelValue", { default: "" });
const props = defineProps({
  placeholder: { type: String, default: "" }, // 链接地址输入提示。
  clearable: { type: Boolean, default: true }, // 链接地址默认提供清空按钮。
  allowDoi: { type: Boolean, default: false }, // 是否识别无协议前缀的 DOI 编号。
});
// 下拉项使用非空标识，确保“自定义”显示为选项而非占位文字。
const CUSTOM_PREFIX = "custom";
const prefixOptions = computed(() => [
  { value: "https://", name: "https" }, // 安全网址前缀。
  { value: "http://", name: "http" }, // 普通网址前缀。
  { value: CUSTOM_PREFIX, name: $t("linkPrefixOriginal") }, // 不添加前缀。
]);

// 空链接默认预选安全协议；已有内容按自身前缀显示。
const prefix = ref("https://");
watch(
  modelValue,
  (value) => {
    const match = String(value || "").match(/^https?:\/\//i);
    if (match) prefix.value = match[0].toLowerCase();
    else if (value) prefix.value = CUSTOM_PREFIX;
    else prefix.value = "https://";
  },
  { immediate: true },
);

const address = computed({
  get: () => String(modelValue.value || "").replace(/^https?:\/\//i, ""),
  set: (value: string) => {
    const text = value.trim();
    const fullUrl = text.match(/^https?:\/\//i);
    if (fullUrl) {
      prefix.value = fullUrl[0].toLowerCase();
      modelValue.value = text;
      return;
    }
    if (props.allowDoi && /^10\.\d{4,9}\//.test(text)) prefix.value = CUSTOM_PREFIX;
    modelValue.value = text ? `${prefix.value === CUSTOM_PREFIX ? "" : prefix.value}${text}` : "";
  },
});

// 切换预选项时只替换协议前缀，不改动链接地址。
const selectPrefix = (value: string) => {
  const text = address.value;
  prefix.value = value;
  modelValue.value = text ? `${value === CUSTOM_PREFIX ? "" : value}${text}` : "";
};
</script>

<template>
  <SfInput v-model="address" :placeholder="placeholder" :clearable="clearable">
    <!-- 前缀选择放入输入框自身的前缀插槽，保持单一边框。 -->
    <template #prefix>
      <SfSelect
        :model-value="prefix"
        :list="prefixOptions"
        :aria-label="$t('linkPrefix')"
        class="url-prefix w-[80px]! flex-none! rounded-none! border-r border-sf-b bg-transparent! text-xs"
        @update:model-value="selectPrefix"
      />
    </template>
  </SfInput>
</template>

<style scoped>
/* 前缀下拉只保留右侧分隔线，不绘制自身四周边框与圆角。 */
.url-prefix.el-select :deep(.el-select__wrapper) {
  min-height: 24px;
  padding: 0 12px 0 3px;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
</style>
