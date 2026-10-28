<script setup>
import { computed, nextTick } from "vue";
import { useFormContext } from "@/components/business/dynamicForm/api";
import { useResumeStore } from "@/stores";
import { MORE_CATEGORIES } from "@/stores/modules/resume/config/formConfig";
import { addUserCustomField } from "@/stores/modules/resume/hooks/useUserCustomField";
import { getUUID } from "@/utils";
import eventBus from "@/utils/modules/eventBus";
import { useScrollEditorTo } from "../../../../hooks/useScrollEditorTo";
import { storeToRefs } from "pinia";
import { translateResumeEditorText } from "@/stores/modules/resume/hooks/useResumeEditorLocale";

const { currentForm, hasFieldData, addField, getFieldDataKey } = useFormContext();
const resumeStore = useResumeStore();
const { runtimeConfig, currentData } = storeToRefs(resumeStore);

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
    fields: availableFields.value
      .filter((field) => field.props?.category === category)
      // 求职岗位在常用入口置顶，不受已有简历保存的字段顺序影响。
      .sort((left, right) => Number(right.key === "position") - Number(left.key === "position")),
  }));
  // 未声明分类的字段归入末尾兜底组，避免新增字段因漏标分类而不展示
  const rest = availableFields.value.filter(
    (field) => !MORE_CATEGORIES.includes(field.props?.category),
  );
  if (rest.length) groups.push({ category: "其他", fields: rest });
  return groups.filter((group) => group.fields.length > 0);
});
// 常用字段不进入下拉，始终直接展示，便于补充高频个人信息。
const commonGroups = computed(() =>
  groupedFields.value.filter((group) => group.category === "常用"),
);
// 其余分类收进入口下拉的面板，避免展开后占据正文空间。
const moreGroups = computed(() => groupedFields.value.filter((group) => group.category !== "常用"));

// 新增字段追加到列表末尾，定位一次便于直接看到落点
function locateAddedField(fieldKey) {
  if (!fieldKey) return;
  nextTick(() => {
    // 定位取字段的卡片外圈，与选中边框范围保持一致
    useScrollEditorTo(document.querySelector(`[data-module-key="${fieldKey}"]`));
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
  <!-- 模块取消默认底部留白后，更多字段区域自行保留底部间距。 -->
  <div class="w-full pb-3">
    <!-- 已添加字段始终显示在入口上方 -->
    <slot />
    <!-- 常用字段始终显示，不收入下拉。 -->
    <div v-for="group in commonGroups" :key="group.category" class="mt-3 flex flex-col gap-3">
      <span class="text-xs text-sf-text-3">{{ translateResumeEditorText(group.category) }}</span>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="field in group.fields"
          :key="getFieldDataKey(field)"
          type="button"
          class="flex h-7 cursor-pointer items-center justify-center gap-1 rounded-3xl border border-sf-b bg-sf-primary px-2 text-xs text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
          @click="handleAdd(field)"
        >
          <SfIcon icon="ic:round-add" size="4" />
          <span>{{ field.props?.label }}</span>
        </button>
      </div>
    </div>
    <!-- 非常用字段合并进入口下拉：面板限高滚动，点选即添加，不占据正文空间。 -->
    <div class="flex items-center gap-3 pt-3">
      <SfDropdown trigger="click" placement="top-start" :show-arrow="false" popper-class="resume-more-optional-dropdown">
        <button
          type="button"
          class="flex h-7 cursor-pointer items-center justify-center gap-1 rounded-3xl border border-sf-b bg-sf-primary px-2 text-xs text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
        >
          <SfIcon icon="ic:round-add" size="4" />
          <span>{{ $t("moreOptional") }}</span>
          <SfIcon icon="mingcute:down-line" size="3" />
        </button>
        <template #dropdown>
          <div class="w-60 rounded-2xl border border-sf-b bg-sf-primary shadow-lg">
            <SfScrollbar max-height="240px">
              <div class="flex flex-col gap-3 py-3">
                <div v-for="group in moreGroups" :key="group.category" class="flex flex-col gap-3">
                  <span class="text-xs text-sf-text-3">{{ translateResumeEditorText(group.category) }}</span>
                  <div class="flex flex-wrap gap-3">
                    <button
                      v-for="field in group.fields"
                      :key="getFieldDataKey(field)"
                      type="button"
                      class="flex h-7 cursor-pointer items-center justify-center gap-1 rounded-3xl border border-sf-b bg-sf-primary px-2 text-xs text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
                      @click="handleAdd(field)"
                    >
                      <SfIcon icon="ic:round-add" size="4" />
                      <span>{{ field.props?.label }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </SfScrollbar>
          </div>
        </template>
      </SfDropdown>
      <!-- 自定义字段保持常驻入口，不收入下拉。 -->
      <button
        type="button"
        class="flex h-7 cursor-pointer items-center justify-center gap-1 rounded-3xl border border-dashed border-sf-b bg-sf-primary px-2 text-xs text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
        @click="handleCreateCustomField"
      >
        <SfIcon icon="ic:round-add" size="4" />
        <span>{{ $t("customField") }}</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
