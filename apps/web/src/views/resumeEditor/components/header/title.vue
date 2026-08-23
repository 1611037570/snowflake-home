<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { resumeTitle } from "../../utils";
import TitleEditor from "./titleEditor.vue";
// 标题编辑器引用
const titleEditorRef = ref(null);
const resumeStore = useResumeStore();
const { currentUsage } = storeToRefs(resumeStore);

const title = computed(() => currentUsage.value?.customTitle || resumeTitle.value);
function handleEditTitle() {
  titleEditorRef.value?.openModal();
}
</script>

<template>
  <div class="flex max-w-[300px] items-center">
    <div class="text-auto">
      {{ title }}
    </div>
    <SfIcon
      icon="lucide:pencil"
      class="ml-2 hover:text-sf-theme-2"
      size="5"
      @click="handleEditTitle"
    />
  </div>
  <TitleEditor :default-title="title" ref="titleEditorRef" />
</template>

<style lang="scss" scoped></style>
