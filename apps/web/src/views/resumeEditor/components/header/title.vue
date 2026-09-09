<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { resumeTitle } from "../../resumeName";
const resumeStore = useResumeStore();
const { currentUsage } = storeToRefs(resumeStore);

// 没有模式字段的旧数据按自定义标题兼容处理
const isCustomTitle = computed(
  () =>
    currentUsage.value?.titleMode === "custom" ||
    (!currentUsage.value?.titleMode && !!currentUsage.value?.customTitle),
);
const title = computed(() =>
  isCustomTitle.value && currentUsage.value?.customTitle
    ? currentUsage.value.customTitle
    : resumeTitle.value,
);
// 编辑标题弹窗
const editTitleVisible = ref(false);
const tempTitle = ref(title.value);

function openModal() {
  tempTitle.value = title.value;
  editTitleVisible.value = true;
}

function handleEditTitle() {
  const customValue = tempTitle.value.trim();
  if (!currentUsage.value) return;
  currentUsage.value.customTitle = customValue;
  currentUsage.value.titleMode = customValue ? "custom" : "auto";
  editTitleVisible.value = !editTitleVisible.value;
}

// 一键切回自动标题，并清除当前自定义标题
function handleAutoTitle() {
  if (!currentUsage.value) return;
  currentUsage.value.titleMode = "auto";
  currentUsage.value.customTitle = "";
  tempTitle.value = resumeTitle.value;
  editTitleVisible.value = false;
}
</script>

<template>
  <div
    class="flex h-9 max-w-[300px] cursor-pointer items-center gap-1 rounded-3xl p-3 hover:bg-sf-page hover:text-sf-theme"
    @click="openModal"
  >
    <SfIcon icon="solar:pen-linear" class="hover:text-sf-theme-2" size="4" />
    <div class="text-auto text-sm">
      {{ title }}
    </div>
  </div>
  <SfModal v-model="editTitleVisible" title="重命名简历">
    <div class="flex w-100 flex-col gap-5 p-4">
      <div class="flex items-center gap-3">
        <SfInput
          v-model="tempTitle"
          placeholder="请输入标题"
          class="w-full rounded-lg border border-sf-b bg-sf-bg"
        />
        <ElButton @click="handleAutoTitle">一键自动</ElButton>
      </div>
      <ElButton type="primary" @click="handleEditTitle" class="w-full">确定</ElButton>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
