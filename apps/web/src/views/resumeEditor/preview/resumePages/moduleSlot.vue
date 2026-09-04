<script setup>
// 模块槽位：wrapper 包装 + 选中高亮 + 模块操作 + 模块内容渲染
// wrapper 类名与 data-module 是分页裁剪样式的锚点，结构不可随意变更
import ModuleActions from "./moduleActions.vue";
import ResumeModule from "../modules/index.vue";

defineProps({
  // 模块 key（分页切片提供，与测量结果的 data-module 对齐）
  moduleKey: {
    type: String,
    required: true,
  },
  // 编辑态才渲染模块操作
  isEdit: {
    type: Boolean,
    default: false,
  },
  // 选中高亮样式类（由上层 useModuleInteractions 计算）
  outlineClass: {
    type: String,
    default: "",
  },
});

defineEmits(["accept", "discard"]);
</script>

<template>
  <div
    class="resume-module-wrapper group group/module relative rounded-xl"
    :data-module="moduleKey"
    :class="outlineClass"
  >
    <ModuleActions
      v-if="isEdit"
      :modelKey="moduleKey"
      @accept="$emit('accept', moduleKey)"
      @discard="$emit('discard', moduleKey)"
    />
    <ResumeModule :name="moduleKey" />
  </div>
</template>

<style lang="scss" scoped></style>
