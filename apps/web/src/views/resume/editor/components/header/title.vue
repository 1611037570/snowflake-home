<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useResumeName } from "../../../hooks/useResumeName";
import RenameResumeModal from "../../../components/renameResumeModal.vue";
const resumeStore = useResumeStore();
const { currentItem, saveStates } = storeToRefs(resumeStore);
const { resumeTitle } = useResumeName();

const title = resumeTitle;
// 标题旁只展示当前简历的真实落库状态，未产生写入时视为已保存。
const saveStatus = computed(() => {
  const id = currentItem.value?.id;
  if (!id) return "";
  return saveStates.value[id]?.status ?? "saved";
});
const saveStatusText = computed(() => {
  if (saveStatus.value === "error") return $t("resumeSaveFailed");
  if (saveStatus.value === "pending" || saveStatus.value === "saving") {
    return $t("resumeSaving");
  }
  return $t("resumeSaved");
});
const saveStatusClass = computed(() => {
  if (saveStatus.value === "error") return "text-sf-error";
  if (saveStatus.value === "pending" || saveStatus.value === "saving") {
    return "animate-pulse text-sf-text-3";
  }
  return "text-sf-success";
});
// 编辑器标题入口复用与我的简历相同的重命名弹窗。
const editTitleVisible = ref(false);

function openModal() {
  editTitleVisible.value = true;
}
</script>

<template>
  <div class="flex min-w-0 items-center gap-3">
    <!-- 标题与编辑铅笔始终显示，便于识别重命名入口。 -->
    <button
      type="button"
      class="group flex h-9 max-w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-3xl p-3 text-sf-text transition-colors hover:bg-sf-bg-2 hover:text-sf-theme md:max-w-[320px]"
      @click="openModal"
    >
      <span class="min-w-0 truncate text-[15px] font-medium">
        {{ title }}
      </span>
      <SfIcon
        icon="solar:pen-linear"
        size="3"
        class="shrink-0 text-sf-text-3"
      />
    </button>
    <span
      v-if="saveStatus"
      class="shrink-0 text-xs transition-colors"
      :class="saveStatusClass"
    >
      {{ saveStatusText }}
    </span>
    <RenameResumeModal v-model="editTitleVisible" :item="currentItem" />
  </div>
</template>

<style lang="scss" scoped></style>
