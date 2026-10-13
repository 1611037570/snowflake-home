<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useResumeName } from "../../../hooks/useResumeName";
import RenameResumeModal from "../../../components/renameResumeModal.vue";
const resumeStore = useResumeStore();
const { currentItem } = storeToRefs(resumeStore);
const { resumeTitle } = useResumeName();

const title = resumeTitle;
// 编辑器标题入口复用与我的简历相同的重命名弹窗。
const editTitleVisible = ref(false);

function openModal() {
  editTitleVisible.value = true;
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
  <RenameResumeModal v-model="editTitleVisible" :item="currentItem" />
</template>

<style lang="scss" scoped></style>
