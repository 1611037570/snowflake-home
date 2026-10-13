<script setup>
import { computed, ref, watch } from "vue";
import { useResumeStore } from "@/stores";
import { useResumeName } from "../hooks/useResumeName";

const props = defineProps({
  modelValue: { type: Boolean, default: false }, // 重命名弹窗是否显示
  item: { type: Object, default: null }, // 当前要重命名的简历
});
const emit = defineEmits(["update:modelValue"]);
const resumeStore = useResumeStore();
const { getResumeTitle } = useResumeName();
const visible = computed({
  get: () => props.modelValue, // 从调用方读取弹窗状态
  set: (value) => emit("update:modelValue", value), // 将关闭状态同步给调用方
});
const tempTitle = ref("");
const pendingTitleMode = ref("auto");

// 每次打开时读取目标简历，避免在列表中沿用上一张卡片的标题。
watch(() => props.modelValue, (opened) => {
  if (!opened) return;
  tempTitle.value = getResumeTitle(props.item);
  pendingTitleMode.value = props.item?.usage?.titleMode || "auto";
});

const handleInput = () => { pendingTitleMode.value = "custom"; };
const handleAutoTitle = () => {
  tempTitle.value = getResumeTitle(props.item);
  pendingTitleMode.value = "auto";
};
const handleSaveTitle = () => {
  const customValue = tempTitle.value.trim();
  const useCustomTitle = pendingTitleMode.value === "custom" && !!customValue;
  if (props.item?.id) {
    resumeStore.renameResume(props.item.id, useCustomTitle ? "custom" : "auto", useCustomTitle ? customValue : "");
  }
  visible.value = false;
};
</script>

<template>
  <!-- 编辑器与我的简历共用同一套重命名及自动标题操作。 -->
  <SfModal v-model="visible" :title="$t('renameResume')">
    <div class="wf flex max-w-100 flex-col gap-3">
      <div class="flex items-center gap-3">
        <div class="flex-1">
          <SfInput
            v-model="tempTitle"
            class="w-full rounded-lg border border-sf-b bg-sf-bg"
            :placeholder="$t('titlePlaceholder')"
            @input="handleInput"
          />
        </div>
        <SfButton :type="pendingTitleMode === 'auto' ? 'theme' : 'bg'" @click="handleAutoTitle">
          {{ $t("autoGenerate") }}
        </SfButton>
      </div>
      <div class="flex justify-end gap-3">
        <SfButton type="bg" @click="visible = false">{{ $t("cancel") }}</SfButton>
        <SfButton @click="handleSaveTitle">{{ $t("save") }}</SfButton>
      </div>
    </div>
  </SfModal>
</template>
