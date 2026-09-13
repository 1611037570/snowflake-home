<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import AddedModels from "./addedModels.vue";
import AddModel from "./addModel.vue";
import { useAiStore } from "@/stores";

const aiStore = useAiStore();
const { modelManagerTab } = storeToRefs(aiStore);

// 内容区 Tab：已添加模型与添加模型共用同一状态。
const tabList: Array<{ name: string; value: "added" | "add" }> = [
  { name: "已添加模型", value: "added" },
  { name: "添加模型", value: "add" },
];

// Tab 下标跟随 store 中的 Tab 值，供 SfTab 指示器动画使用。
const activeIndex = computed({
  get: () => tabList.findIndex((item) => item.value === modelManagerTab.value),
  set: (index) => {
    const tab = tabList[index];
    if (tab) modelManagerTab.value = tab.value;
  },
});

// 「去添加」：从已添加模型 Tab 跳转到添加模型 Tab。
function jumpToAdd() {
  modelManagerTab.value = "add";
}

// 「添加成功」：从添加模型 Tab 切回已添加模型 Tab。
function jumpToAdded() {
  modelManagerTab.value = "added";
}
</script>

<template>
  <div class="flex h-full flex-col gap-3">
    <SfTab :list="tabList" v-model="modelManagerTab" v-model:index="activeIndex" />
    <div v-show="modelManagerTab === 'added'" class="flex min-h-0 flex-1 flex-col">
      <AddedModels class="h-full" @jump-add="jumpToAdd" />
    </div>
    <div v-show="modelManagerTab === 'add'" class="flex min-h-0 flex-1 flex-col">
      <AddModel class="h-full" @add-success="jumpToAdded" />
    </div>
  </div>
</template>
