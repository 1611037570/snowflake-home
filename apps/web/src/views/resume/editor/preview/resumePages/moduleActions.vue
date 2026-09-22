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
  // 可用移动方向：由预览层按栏位与前后位置计算，不可用的方向不渲染按钮
  directions: {
    type: Object,
    default: () => ({ up: false, down: false, left: false, right: false }),
  },
});
const emit = defineEmits({ move: (direction) => typeof direction === "string" });
const isSelected = computed(() => selectedModule.value.find((item) => item.key === props.modelKey));
// 选择按钮状态独立于模块边框，点击后保持按钮自身激活显示
const handleSelect = () => {
  if (isSelected.value) {
    resumeStore.unselectModule(props.modelKey);
  } else {
    resumeStore.selectModule(props.modelKey);
  }
};
// 移动按钮样式：与选择按钮一致的悬浮显示
const moveButtonClass =
  "hidden cursor-pointer items-center justify-center rounded-full bg-sf-info p-1.5 text-white shadow hover:bg-sf-theme group-hover/module:flex";
</script>

<template>
  <div class="absolute -top-3 -right-3 z-10 flex items-center gap-1">
    <SfTooltip v-if="directions.up" content="上移">
      <div :class="moveButtonClass" @click.stop="emit('move', 'up')">
        <SfIcon icon="lucide:arrow-up" size="3.5" />
      </div>
    </SfTooltip>
    <SfTooltip v-if="directions.down" content="下移">
      <div :class="moveButtonClass" @click.stop="emit('move', 'down')">
        <SfIcon icon="lucide:arrow-down" size="3.5" />
      </div>
    </SfTooltip>
    <SfTooltip v-if="directions.left" content="移到左栏">
      <div :class="moveButtonClass" @click.stop="emit('move', 'left')">
        <SfIcon icon="lucide:arrow-left" size="3.5" />
      </div>
    </SfTooltip>
    <SfTooltip v-if="directions.right" content="移到右栏">
      <div :class="moveButtonClass" @click.stop="emit('move', 'right')">
        <SfIcon icon="lucide:arrow-right" size="3.5" />
      </div>
    </SfTooltip>
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
