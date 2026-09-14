<script setup lang="ts">
import { useResumeStore } from "@/stores";
import {
  removeUserCustomField,
  renameUserCustomField,
} from "@/stores/modules/resume/hooks/useUserCustomField";
import { storeToRefs } from "pinia";

const props = defineProps<{
  modelValue?: string;
  fieldKey: string;
  placeholder?: string;
}>();
const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
const resumeStore = useResumeStore();
const { runtimeConfig, currentData } = storeToRefs(resumeStore);
const showRenameModal = ref(false);
const fieldLabel = ref("");

// 打开重命名弹窗时读取当前字段标题，避免编辑中直接修改配置
function openRenameModal() {
  const userField = runtimeConfig.value?.fields?.find((field: any) => field?.key === "user");
  const moreField = userField?.fields?.find((field: any) => field?.key === "more");
  fieldLabel.value = moreField?.fields?.find((field: any) => field?.key === props.fieldKey)?.label || "";
  showRenameModal.value = true;
}

// 保存非空标题，并由运行时配置监听自动持久化
function handleRename() {
  const label = fieldLabel.value.trim();
  if (!label || !runtimeConfig.value) return;

  renameUserCustomField(runtimeConfig.value, props.fieldKey, label);
  showRenameModal.value = false;
}

// 删除字段节点和值，避免自定义字段重新出现在预设列表
function handleRemove() {
  if (!runtimeConfig.value || !currentData.value) return;
  removeUserCustomField(runtimeConfig.value, currentData.value, props.fieldKey);
}
</script>

<template>
  <div class="flex w-full items-center gap-3">
    <SfInput
      class="min-w-0 flex-1"
      :model-value="modelValue"
      :placeholder="placeholder"
      clearable
      @update:model-value="emit('update:modelValue', $event)"
    />
    <button
      type="button"
      class="flex cursor-pointer items-center text-sf-text-2 hover:text-sf-theme"
      title="修改字段名称"
      @click.stop="openRenameModal"
    >
      <SfIcon icon="lucide:pencil" size="4" />
    </button>
    <button
      type="button"
      class="flex cursor-pointer items-center text-sf-text-2 hover:text-red-500"
      title="删除字段"
      @click.stop="handleRemove"
    >
      <SfIcon icon="ic:round-delete" size="4" />
    </button>
  </div>

  <SfModal v-model="showRenameModal" title="修改字段名称">
    <form class="flex w-80 flex-col gap-3 p-3" @submit.prevent="handleRename">
      <SfInput v-model="fieldLabel" placeholder="请输入字段名称" />
      <footer class="flex justify-end gap-3">
        <el-button @click="showRenameModal = false">取消</el-button>
        <el-button type="primary" :disabled="!fieldLabel.trim()" @click="handleRename"
          >保存</el-button
        >
      </footer>
    </form>
  </SfModal>
</template>

<style scoped></style>
