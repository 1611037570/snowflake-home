<script setup>
import { computed, inject } from "vue";
import { useResumeStore } from "@/stores";
import { EXPANDED } from "@/stores/modules/resume/formConfig";
import { addUserCustomField } from "@/stores/modules/resume/hooks/useUserCustomField";
import { getUUID } from "@/utils";
import { storeToRefs } from "pinia";

const { currentForm, hasFieldData, addField, getFieldDataKey } = inject("df/context")();
const resumeStore = useResumeStore();
const { runtimeConfig, currentData } = storeToRefs(resumeStore);

// 更多配置展开状态：数组含 "1" 表示展开，与模块折叠语义一致
const collapsed = defineModel("collapsed", {
  type: Array,
  default: () => [],
});

const expanded = computed(() => collapsed.value.includes(EXPANDED[0] ?? "1"));
// 只展示结构中声明为可添加且数据路径尚不存在的字段
const availableFields = computed(() =>
  (currentForm.value?.fields ?? []).filter(
    (field) => field.addable && getFieldDataKey(field) && !hasFieldData(field),
  ),
);

// 切换展开/收起
function toggle() {
  collapsed.value = expanded.value ? [] : [...EXPANDED];
}

// 字段添加交由动态表单写入真实数据
function handleAdd(field) {
  addField(field);
  // Newly added fields are appended after the existing visible fields.
  const fields = currentForm.value?.fields;
  const index = fields?.indexOf(field) ?? -1;
  if (index >= 0) {
    fields.splice(index, 1);
    fields.push(field);
  }
}

// 自定义字段直接以默认名称插入更多字段配置，并写入对应的真实数据值
function handleCreateCustomField() {
  const label = "尚未填写";
  if (!runtimeConfig.value || !currentData.value) return;

  const key = `custom_${getUUID().substring(0, 8)}`;
  addUserCustomField(runtimeConfig.value, currentData.value, key, label);
}
</script>

<template>
  <div class="w-full">
    <!-- 已添加字段始终显示在选择入口上方 -->
    <slot />
    <!-- 更多配置开关 -->
    <button
      type="button"
      class="flex cursor-pointer items-center gap-3 pt-3 text-sm text-sf-theme transition-colors"
      @click="toggle"
    >
      <span>{{ expanded ? "收起更多" : "展开更多" }}</span>
      <SfIcon :icon="expanded ? 'fa6-solid:caret-up' : 'fa6-solid:caret-down'" size="3" />
    </button>
    <!-- 展开后展示尚未添加的字段 -->
    <div v-if="expanded" class="mt-3 flex flex-wrap gap-3">
      <button
        v-for="field in availableFields"
        :key="getFieldDataKey(field)"
        type="button"
        class="border-sf-border flex h-9 cursor-pointer items-center justify-center gap-3 rounded-3xl border bg-sf-primary px-3 text-sm text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
        @click="handleAdd(field)"
      >
        <SfIcon icon="ic:round-add" size="4" />
        <span>{{ field.props?.label }}</span>
      </button>
      <button
        type="button"
        class="border-sf-border flex h-9 cursor-pointer items-center justify-center gap-3 rounded-3xl border border-dashed bg-sf-primary px-3 text-sm text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
        @click="handleCreateCustomField"
      >
        <SfIcon icon="ic:round-add" size="4" />
        <span>自定义字段</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
