<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { resumeTitle } from "../../resumeName";
const resumeStore = useResumeStore();
const { currentUsage } = storeToRefs(resumeStore);

const title = computed(() => currentUsage.value?.customTitle || resumeTitle.value);
// 编辑标题弹窗
const editTitleVisible = ref(false);
const custom = ref(currentUsage.value?.customTitle || false);
const tempTitle = ref(title.value);

function openModal() {
  tempTitle.value = title.value;
  editTitleVisible.value = true;
}

function handleEditTitle() {
  const customValue = tempTitle.value.trim();
  currentUsage.value.customTitle = custom.value ? customValue : "";
  editTitleVisible.value = !editTitleVisible.value;
}

function handleInput() {
  custom.value = true;
}

function handleResetTitle() {
  tempTitle.value = resumeTitle.value;
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
          @input="handleInput"
          v-model="tempTitle"
          placeholder="请输入标题"
          class="w-full rounded-lg border border-sf-b bg-sf-bg"
        />
        <ElButton @click="handleResetTitle">重置</ElButton>
      </div>
      <ElButton type="primary" @click="handleEditTitle" class="w-full">确定</ElButton>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
