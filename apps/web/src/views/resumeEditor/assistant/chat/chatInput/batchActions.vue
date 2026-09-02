<script setup>
import { computed, inject } from "vue";

// 注入预览层全局操作：全部保留 / 全部放弃
const previewData = inject("previewData");
const acceptAll = inject("acceptAll");
const rejectAll = inject("rejectAll");

// 判断整份简历是否存在待应用的 AI 草稿（用于控制全部保留/放弃按钮显隐）
const hasNewData = computed(() => {
  if (!previewData) return false;
  // 递归检查节点中是否含非空 newValue
  const checkHasNew = (node) => {
    if (node === null || typeof node !== "object") return false;
    // 叶子字段：newValue 非空即存在草稿
    if ("value" in node && "newValue" in node) {
      return node.newValue != null && node.newValue !== "";
    }
    // 数组：遍历每个元素
    if (Array.isArray(node)) return node.some((item) => checkHasNew(item));
    // 普通对象：遍历所有自有属性
    for (const key in node) {
      if (Object.prototype.hasOwnProperty.call(node, key) && checkHasNew(node[key])) {
        return true;
      }
    }
    return false;
  };
  return checkHasNew(previewData.value);
});
</script>

<template>
  <!-- 全部放弃 / 全部保留：存在 AI 草稿时显示 -->
  <div v-if="hasNewData" class="mt-1 flex items-center gap-1">
    <SfTooltip content="全部放弃">
      <div
        class="flex cursor-pointer items-center justify-center rounded-full bg-red-500 p-1.5 text-white shadow hover:bg-red-600"
        @click.stop="rejectAll"
      >
        <SfIcon icon="lucide:x" size="4" />
      </div>
    </SfTooltip>
    <SfTooltip content="全部保留">
      <div
        class="flex cursor-pointer items-center justify-center rounded-full bg-green-500 p-1.5 text-white shadow hover:bg-green-600"
        @click.stop="acceptAll"
      >
        <SfIcon icon="lucide:check" size="4" />
      </div>
    </SfTooltip>
  </div>
</template>
