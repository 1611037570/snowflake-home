<script setup>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import {
  DESENSITIZE_FIELD_GROUP_OPTIONS,
  DESENSITIZE_FIELD_OPTIONS,
  DESENSITIZE_PRESET_OPTIONS,
  normalizeDesensitizeFields,
} from "@/stores/modules/resume/config/desensitizeConfig";

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
    <div class="flex max-h-[72vh] min-h-0 flex-col">
      <!-- 仅预设和字段区域滚动，底部操作始终固定。 -->
      <SfScrollbar class="min-h-0 flex-1!" max-height="60vh" view-class="flex flex-col gap-3 pr-3" flush>
        <section class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p class="shrink-0 text-sm font-medium">快捷预设</p>
          <div class="grid flex-1 grid-cols-3 gap-3">
            <SfButton
              v-for="item in DESENSITIZE_PRESET_OPTIONS"
              :key="item.key"
              :type="isPresetActive(item.fields) ? 'theme' : 'bg'"
              :title="item.description"
              size="small"
              border
              class="w-full! whitespace-nowrap"
              @click="applyPreset(item)"
            >
              {{ item.name }}
            </SfButton>
          </div>
        </section>

        <section
          v-for="group in DESENSITIZE_FIELD_GROUP_OPTIONS"
          :key="group.key"
          class="rounded-xl border border-sf-border p-3"
        >
          <header class="mb-3 flex items-center justify-between gap-3">
            <p class="font-medium">{{ group.name }}</p>
            <p class="text-xs text-sf-text-3">
              已选 {{ selectedGroupCount(group.key) }}/{{ groupedFields(group.key).length }}
            </p>
          </header>
          <!-- 字段只保留名称，减少大量说明造成的纵向占用。 -->
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <el-checkbox
              v-for="item in groupedFields(group.key)"
              :key="item.key"
              v-model="draftFields"
              :value="item.key"
              :title="item.description"
              class="m-0! h-9! min-w-0! rounded-xl border border-sf-border bg-sf-bg px-3!"
            >
              <span class="truncate text-sm text-sf-text">{{ item.name }}</span>
            </el-checkbox>
          </div>
        </section>
      </SfScrollbar>

      <footer class="mt-3 flex flex-none items-center justify-between gap-3 border-t border-sf-border pt-3">
        <span class="text-xs text-sf-text-3">
          已选择 {{ draftFields.length }}/{{ DESENSITIZE_FIELD_OPTIONS.length }} 项
        </span>
        <div class="flex gap-3">
          <SfButton type="bg" size="small" @click="clearAll">清空选择</SfButton>
          <SfButton type="bg" size="small" @click="visible = false">取消</SfButton>
          <SfButton type="theme" size="small" @click="handleConfirm">确认</SfButton>
        </div>
      </footer>
    </div>
  </SfModal>
</template>
