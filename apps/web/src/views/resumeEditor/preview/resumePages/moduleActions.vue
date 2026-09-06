<script setup>
import { computed } from "vue";
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";

const resumeStore = useResumeStore();
const { selectedModule } = storeToRefs(resumeStore);

const props = defineProps({
  modelKey: {
    type: String,
    default: "",
  },
});
const isSelected = computed(() => selectedModule.value.find((item) => item.key === props.modelKey));
// 点击选择/取消选择模块：统一走 store 操作切换选中态
const handleSelect = () => {
  if (isSelected.value) {
    resumeStore.unselectModule(props.modelKey);
  } else {
    resumeStore.selectModule(props.modelKey);
  }
};
</script>

<template>
  <div class="absolute -top-3 -right-3 z-10 flex items-center gap-1">
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
