<script setup>
import { inject, computed } from "vue";
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
defineEmits(["discard", "accept", "select"]);
const isSelected = computed(() => selectedModule.value.find((item) => item.key === props.modelKey));
// 接收上游注入的预览数据
const previewData = inject("previewData");
// 获取当前模块的代理数据
const moduleData = computed(() => {
  if (!previewData || !props.modelKey) return null;
  return previewData.value[props.modelKey];
});
// 判断当前模块是否有待应用的 AI 草稿
const hasNewData = computed(() => {
  const module = moduleData.value;
  if (!module || typeof module !== "object") return false;

  // 递归检查函数
  const checkHasNew = (node) => {
    // 基础类型直接返回 false
    if (node === null || typeof node !== "object") return false;

    // 判断是否是叶子字段（拥有 value 和 newValue 属性）
    if ("value" in node && "newValue" in node) {
      // 注意：newValue 可能是空字符串、null、undefined，需要判断是否非空
      return node.newValue != null && node.newValue !== "";
    }

    // 如果是数组，遍历每个元素
    if (Array.isArray(node)) {
      return node.some((item) => checkHasNew(item));
    }

    // 如果是普通对象（非数组、非叶子），遍历其所有属性值
    // 使用 Object.values 或 for...in
    for (const key in node) {
      if (Object.prototype.hasOwnProperty.call(node, key)) {
        if (checkHasNew(node[key])) {
          return true; // 一旦找到立即返回，提高效率
        }
      }
    }
    return false;
  };

  return checkHasNew(module);
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
