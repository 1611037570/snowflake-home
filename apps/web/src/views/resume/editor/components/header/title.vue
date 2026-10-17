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
  <!-- 标题常显、字号加大；悬停区域沿用原来的 p-3 与 3xl 圆角，铅笔只在悬停时出现 -->
  <div
    class="group flex h-9 max-w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-3xl p-3 text-sf-text transition-colors hover:bg-sf-bg-2 hover:text-sf-theme md:max-w-[320px]"
    @click="openModal"
  >
    <div class="min-w-0 truncate text-[15px] font-medium">
      {{ title }}
    </div>
    <SfIcon
      icon="solar:pen-linear"
      size="3"
      class="shrink-0 text-sf-text-3 opacity-0 transition-opacity group-hover:opacity-100"
    />
  </div>
  <RenameResumeModal v-model="editTitleVisible" :item="currentItem" />
</template>

<style lang="scss" scoped></style>
