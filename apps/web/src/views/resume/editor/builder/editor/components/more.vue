<script setup>
import { computed, nextTick } from "vue";
import { useFormContext } from "@/components/business/dynamicForm/api";
import { useResumeStore } from "@/stores";
import { EXPANDED, MORE_CATEGORIES } from "@/stores/modules/resume/config/formConfig";
import { addUserCustomField } from "@/stores/modules/resume/hooks/useUserCustomField";
import { getUUID } from "@/utils";
import eventBus from "@/utils/modules/eventBus";
import { scrollEditorTo } from "../../../scrollEditorTo";
import { storeToRefs } from "pinia";
import { translateResumeEditorText } from "@/stores/modules/resume/hooks/useResumeEditorLocale";

const { currentForm, hasFieldData, addField, getFieldDataKey } = useFormContext();
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

// 按分类聚合可添加字段：分类顺序固定，空分类不展示
const groupedFields = computed(() => {
  const groups = MORE_CATEGORIES.map((category) => ({
    category,
    fields: availableFields.value.filter((field) => field.props?.category === category),
  }));
  // 未声明分类的字段归入末尾兜底组，避免新增字段因漏标分类而不展示
  const rest = availableFields.value.filter(
    (field) => !MORE_CATEGORIES.includes(field.props?.category),
  );
  if (rest.length) groups.push({ category: "其他", fields: rest });
  return groups.filter((group) => group.fields.length > 0);
});

// 切换展开/收起
function toggle() {
  collapsed.value = expanded.value ? [] : [...EXPANDED];
}

// 新增字段追加到列表末尾，定位一次便于直接看到落点
function locateAddedField(fieldKey) {
  if (!fieldKey) return;
  nextTick(() => {
    // 定位取字段的卡片外圈，与选中边框范围保持一致
    scrollEditorTo(document.querySelector(`[data-module-key="${fieldKey}"]`));
    eventBus.emit("df-select-module", fieldKey);
    // user 子字段添加后同步定位预览区的 user 模块
    eventBus.emit("resume-locate-preview-module", "user");
  });
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
  locateAddedField(field?.key);
}

// 自定义字段直接以默认名称插入更多字段配置，并写入对应的真实数据值
function handleCreateCustomField() {
  const label = "尚未填写";
  if (!runtimeConfig.value || !currentData.value) return;

  const key = `custom_${getUUID().substring(0, 8)}`;
  addUserCustomField(runtimeConfig.value, currentData.value, key, label);
  locateAddedField(key);
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
      <span>{{ expanded ? $t("collapseMore") : $t("expandMore") }}</span>
      <SfIcon :icon="expanded ? 'fa6-solid:caret-up' : 'fa6-solid:caret-down'" size="3" />
    </button>
    <!-- 展开后按分类展示尚未添加的字段 -->
    <div v-if="expanded" class="mt-3 flex flex-col gap-3">
      <div v-for="group in groupedFields" :key="group.category" class="flex flex-col gap-3">
        <span class="text-xs text-sf-text-3">{{ translateResumeEditorText(group.category) }}</span>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="field in group.fields"
            :key="getFieldDataKey(field)"
            type="button"
            class="border-sf-border flex h-7 cursor-pointer items-center justify-center gap-1 rounded-3xl border bg-sf-primary px-2 text-xs text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
            @click="handleAdd(field)"
          >
            <SfIcon icon="ic:round-add" size="4" />
            <span>{{ field.props?.label }}</span>
          </button>
        </div>
      </div>
      <button
        type="button"
        class="border-sf-border flex h-7 w-fit cursor-pointer items-center justify-center gap-1 rounded-3xl border border-dashed bg-sf-primary px-2 text-xs text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
        @click="handleCreateCustomField"
      >
        <SfIcon icon="ic:round-add" size="4" />
        <span>{{ $t("customField") }}</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
