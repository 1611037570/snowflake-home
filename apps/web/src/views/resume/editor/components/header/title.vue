<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { resumeTitle } from "../../resumeName";
const resumeStore = useResumeStore();
const { currentUsage } = storeToRefs(resumeStore);

const title = resumeTitle;
// 编辑标题弹窗
const editTitleVisible = ref(false);
const tempTitle = ref(title.value);
const pendingTitleMode = ref("auto");

function openModal() {
  tempTitle.value = title.value;
  pendingTitleMode.value = currentUsage.value?.titleMode || "auto";
  editTitleVisible.value = true;
}

function closeModal() {
  editTitleVisible.value = false;
}

function handleSaveTitle() {
  const customValue = tempTitle.value.trim();
  if (!currentUsage.value) return closeModal();
  const useCustomTitle = pendingTitleMode.value === "custom" && !!customValue;
  currentUsage.value.customTitle = useCustomTitle ? customValue : "";
  currentUsage.value.titleMode = useCustomTitle ? "custom" : "auto";
  closeModal();
}

// 输入自定义内容后切换为自定义模式，等待点击保存才写入简历
function handleInput() {
  pendingTitleMode.value = "custom";
}

// 一键预览自动标题，等待点击保存才切换模式
function handleAutoTitle() {
  tempTitle.value = resumeTitle.value;
  pendingTitleMode.value = "auto";
}

// 取消编辑并关闭弹窗，不保存临时标题
function handleCancel() {
  closeModal();
}
</script>

<template>
  <div
    class="flex h-9 max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-3xl p-3 hover:bg-sf-bg-2 hover:text-sf-theme md:max-w-[300px]"
    @click="openModal"
  >
    <SfIcon icon="solar:pen-linear" class="shrink-0 hover:text-sf-theme-2" size="4" />
    <div class="text-auto hidden min-w-0 truncate text-sm md:flex">
      {{ title }}
    </div>
  </div>
  <SfModal v-model="editTitleVisible" :title="$t('renameResume')">
    <div class="wf flex max-w-100 flex-col gap-3">
      <div class="flex items-center gap-3">
        <div class="flex-1">
          <SfInput
            @input="handleInput"
            v-model="tempTitle"
            :placeholder="$t('titlePlaceholder')"
            class="w-full rounded-lg border border-sf-b bg-sf-bg"
          />
        </div>
        <SfButton @click="handleAutoTitle">{{ $t("autoGenerate") }}</SfButton>
      </div>
      <div class="flex justify-end gap-3">
        <SfButton type="bg" @click="handleCancel">{{ $t("cancel") }}</SfButton>
        <SfButton @click="handleSaveTitle">{{ $t("save") }}</SfButton>
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
