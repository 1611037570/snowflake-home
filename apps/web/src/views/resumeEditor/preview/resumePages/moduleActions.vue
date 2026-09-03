<script setup>
import { inject, computed } from "vue";
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { hasModuleNewValue } from "../usePreviewData";

const resumeStore = useResumeStore();
const { selectedModule } = storeToRefs(resumeStore);

const props = defineProps({
  modelKey: {
    type: String,
    default: "",
  },
});
defineEmits(["discard", "accept", "select"]);
const isSelected = computed(() => selectedModule.value.find((item) => item.key === props.modelKey));
// 接收上游注入的预览数据
const previewData = inject("previewData");
// 判断当前模块是否有待应用的 AI 草稿：
// 模块存在性走预览代理，草稿有无走模块级计数索引，O(1) 判定替代整树递归扫描
const hasNewData = computed(() => {
  if (!props.modelKey) return false;
  if (!previewData?.value?.[props.modelKey]) return false;
  return hasModuleNewValue(props.modelKey);
});
// 点击选择/取消选择模块：已选中则从列表移除，未选中则加入
const handleSelect = () => {
  if (isSelected.value) {
    const index = selectedModule.value.findIndex((item) => item.key === props.modelKey);
    if (index > -1) selectedModule.value.splice(index, 1);
  } else {
    resumeStore.pushSelectedModule(props.modelKey);
  }
};
</script>

<template>
  <div class="absolute -top-3 -right-3 z-10 flex items-center gap-1">
    <template v-if="hasNewData">
      <SfTooltip content="该模块全部放弃">
        <div
          class="hidden cursor-pointer items-center justify-center rounded-full bg-red-500 p-1.5 text-white shadow group-hover/module:flex hover:bg-red-600"
          @click.stop="$emit('discard')"
        >
          <SfIcon icon="lucide:x" size="4" />
        </div>
      </SfTooltip>
      <SfTooltip content="该模块全部保留">
        <div
          class="hidden cursor-pointer items-center justify-center rounded-full bg-green-500 p-1.5 text-white shadow group-hover/module:flex hover:bg-green-600"
          @click.stop="$emit('accept')"
        >
          <SfIcon icon="lucide:check" size="4" />
        </div>
      </SfTooltip>
    </template>
    <SfTooltip :content="isSelected ? '取消选择' : '选择模块'">
      <div
        class="cursor-pointer items-center justify-center rounded-full p-1.5 text-white shadow hover:bg-sf-theme"
        :class="isSelected ? 'flex bg-sf-theme ' : 'hidden bg-sf-info group-hover/module:flex '"
        @click.stop="handleSelect"
      >
        <SfIcon icon="lucide:pencil" size="3.5" />
      </div>
    </SfTooltip>
  </div>
</template>
