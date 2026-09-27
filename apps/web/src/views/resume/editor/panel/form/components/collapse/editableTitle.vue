<script setup>
import { ref } from "vue";
import Icon from "../icon.vue";

const modelValue = defineModel();
// 标题编辑弹窗与临时输入值
const showEditModal = ref(false);
const editedTitle = ref("");

// 打开弹窗时回填当前标题
function openEditModal() {
  editedTitle.value = modelValue.value || "";
  showEditModal.value = true;
}

// 保存非空标题
function saveTitle() {
  const value = editedTitle.value.trim();
  if (!value) return;
  modelValue.value = value;
  showEditModal.value = false;
}
</script>
<template>
  <div class="flex min-w-0 flex-1 items-center gap-1">
    <span class="min-w-0 truncate">{{ modelValue }}</span>
    <Icon @click="openEditModal" icon="lucide:pencil" />
  </div>
  <SfModal v-model="showEditModal" :title="$t('editTitle')">
    <form class="flex w-80 flex-col gap-3" @submit.prevent="saveTitle">
      <SfInput v-model="editedTitle" :placeholder="$t('titlePlaceholder')" />
      <footer class="flex justify-end gap-3">
        <SfButton type="bg" @click="showEditModal = false">{{ $t("cancel") }}</SfButton>
        <SfButton :disabled="!editedTitle.trim()" @click="saveTitle">{{ $t("save") }}</SfButton>
      </footer>
    </form>
  </SfModal>
</template>

<style lang="scss" scoped></style>
