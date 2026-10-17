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
        <section class="flex flex-col gap-3 rounded-xl border border-sf-border bg-sf-bg p-3">
          <div>
            <p class="font-medium">快捷预设</p>
            <p class="mt-3 text-xs text-sf-text-3">应用预设后仍可调整具体字段</p>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SfButton
              v-for="item in DESENSITIZE_PRESET_OPTIONS"
              :key="item.key"
              :type="isPresetActive(item.fields) ? 'theme' : 'bg'"
              size="small"
              border
              class="h-auto! w-full! justify-start! p-3! text-left"
              @click="applyPreset(item)"
            >
              <span class="flex min-w-0 flex-col gap-3">
                <span class="font-medium">{{ item.name }}</span>
                <span class="whitespace-normal text-xs opacity-75">{{ item.description }}</span>
              </span>
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
            <p class="text-xs text-sf-text-3">{{ group.description }}</p>
          </header>
          <!-- 字段只保留名称，减少大量说明造成的纵向占用。 -->
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <el-checkbox
              v-for="item in groupedFields(group.key)"
              :key="item.key"
              v-model="draftFields"
              :value="item.key"
              :title="item.description"
              class="m-0! h-6! min-w-0!"
            >
              <span class="truncate text-sm text-sf-text">{{ item.name }}</span>
            </el-checkbox>
          </div>
        </section>
      </SfScrollbar>

      <footer class="mt-3 flex flex-none items-center justify-between gap-3 border-t border-sf-border pt-3">
        <span class="text-xs text-sf-text-3">已选择 {{ draftFields.length }} 项</span>
        <div class="flex gap-3">
          <SfButton type="bg" size="small" @click="clearAll">清空选择</SfButton>
          <SfButton type="bg" size="small" @click="visible = false">取消</SfButton>
          <SfButton type="theme" size="small" @click="handleConfirm">确认</SfButton>
        </div>
      </footer>
    </div>
  </SfModal>
</template>
