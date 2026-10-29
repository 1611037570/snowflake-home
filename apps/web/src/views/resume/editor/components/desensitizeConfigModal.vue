<script setup>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import {
  DESENSITIZE_FIELD_GROUP_OPTIONS,
  DESENSITIZE_FIELD_OPTIONS,
  DESENSITIZE_PRESET_OPTIONS,
  normalizeDesensitizeFields,
} from "@snowflake/resume-core/privacy";

const props = defineProps({
  modelValue: {
    type: Boolean, // 弹窗是否显示。
    default: false, // 默认关闭弹窗。
  },
});
const emit = defineEmits(["update:modelValue", "confirm"]);
const resumeStore = useResumeStore();
const { desensitizeMode } = storeToRefs(resumeStore);
const draftFields = ref([]);
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
const groupedFields = (group) => DESENSITIZE_FIELD_OPTIONS.filter((item) => item.group === group);
const selectedGroupCount = (group) =>
  groupedFields(group).filter((item) => draftFields.value.includes(item.key)).length;

watch(
  () => props.modelValue,
  (value) => {
    if (value) draftFields.value = [...normalizeDesensitizeFields(desensitizeMode.value)];
  },
);

// 快捷预设只更新草稿，用户确认后才保存。
const applyPreset = (item) => {
  draftFields.value = [...item.fields];
};
const isPresetActive = (fields) =>
  draftFields.value.length === fields.length && fields.every((field) => draftFields.value.includes(field));
const clearAll = () => {
  draftFields.value = [];
};
const handleConfirm = () => {
  const selectedFields = [...draftFields.value];
  resumeStore.desensitizeMode = { selectedFields };
  emit("confirm", selectedFields);
  visible.value = false;
};
</script>

<template>
  <SfModal v-model="visible" title="选择脱敏内容" width="720px">
    <div class="desensitize-fields flex max-h-[72vh] min-h-0 flex-col gap-3">
      <!-- 仅预设和字段区域滚动，底部操作始终固定。 -->
      <SfScrollbar class="min-h-0 flex-1!" max-height="60vh" view-class="flex flex-col gap-3 pr-3" flush>
        <!-- 预设压缩为单行入口，统一使用项目胶囊圆角。 -->
        <section class="flex flex-wrap items-center gap-3">
          <p class="shrink-0 text-sm font-medium text-sf-text">快捷预设</p>
          <div class="grid flex-1 grid-cols-3 gap-3">
            <button
              v-for="item in DESENSITIZE_PRESET_OPTIONS"
              :key="item.key"
              type="button"
              class="flex h-9 cursor-pointer items-center justify-center rounded-3xl border px-3 text-center transition-colors"
              :class="isPresetActive(item.fields) ? 'border-sf-text-3 bg-sf-bg' : 'border-sf-b bg-sf-primary hover:bg-sf-bg'"
              :aria-pressed="isPresetActive(item.fields)"
              @click="applyPreset(item)"
            >
              <span class="whitespace-nowrap text-xs text-sf-text">{{ item.name }}</span>
            </button>
          </div>
        </section>

        <section
          v-for="group in DESENSITIZE_FIELD_GROUP_OPTIONS"
          :key="group.key"
          class="flex flex-col"
        >
          <header class="flex items-center justify-between gap-3">
            <p class="text-sm font-medium leading-6 text-sf-text">{{ group.name }}</p>
            <p class="shrink-0 text-xs leading-6 text-sf-text-3">
              已选 {{ selectedGroupCount(group.key) }}/{{ groupedFields(group.key).length }}
            </p>
          </header>
          <!-- 字段紧凑排列，不展示悬停说明。 -->
          <div class="grid grid-cols-2 gap-x-3 sm:grid-cols-4">
            <el-checkbox
              v-for="item in groupedFields(group.key)"
              :key="item.key"
              v-model="draftFields"
              :value="item.key"
              class="m-0! h-9! w-full! min-w-0! rounded-3xl px-3! transition-colors hover:bg-sf-bg"
            >
              <span class="truncate text-sm text-sf-text-2">{{ item.name }}</span>
            </el-checkbox>
          </div>
        </section>
      </SfScrollbar>

      <!-- 选择摘要与次要操作置左，确认操作固定在右侧。 -->
      <footer class="flex flex-none flex-wrap items-center justify-between gap-3 border-t border-sf-b pt-3">
        <div class="flex items-center gap-3">
          <span class="text-xs text-sf-text-3">
            已选择 <span class="font-medium text-sf-text">{{ draftFields.length }}</span> / {{ DESENSITIZE_FIELD_OPTIONS.length }} 项
          </span>
          <SfButton type="bg" size="small" @click="clearAll">清空选择</SfButton>
        </div>
        <div class="flex gap-3">
          <SfButton type="bg" size="small" @click="visible = false">取消</SfButton>
          <SfButton type="theme" size="small" @click="handleConfirm">应用选择</SfButton>
        </div>
      </footer>
    </div>
  </SfModal>
</template>

<style scoped>
/* 复选框使用中性前景色，主题色仅用于底部确认操作。 */
.desensitize-fields :deep(.el-checkbox) {
  --el-checkbox-checked-bg-color: var(--sf-text);
  --el-checkbox-checked-input-border-color: var(--sf-text);
  --el-checkbox-checked-text-color: var(--sf-text);
  --el-checkbox-input-border-color-hover: var(--sf-text-3);
}
.desensitize-fields :deep(.el-checkbox__inner::after) {
  border-color: var(--sf-primary);
}
</style>
