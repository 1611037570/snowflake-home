<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import AddedModels from "./addedModels.vue";
import AddModel from "./addModel.vue";
import { useAiStore } from "@/stores";
import { PROVIDER_NAMES } from "@/configs";

const aiStore = useAiStore();
const { modelManagerTab, modelList } = storeToRefs(aiStore);

// 角色选择器展示已添加的模型配置
const modelOptions = computed(() =>
  modelList.value.map((model) => ({
    value: model.id,
    name: model.name || model.model || PROVIDER_NAMES[model.provider] || model.provider,
  })),
);

// 角色选择器默认兼容旧的当前模型，修改后独立保存
const xiaoZhouModel = computed({
  get: () => aiStore.getAgentModelId("xiaoZhou"),
  set: (modelId: string) => aiStore.setAgentModel("xiaoZhou", modelId),
});
const xiaoYangModel = computed({
  get: () => aiStore.getAgentModelId("xiaoYang"),
  set: (modelId: string) => aiStore.setAgentModel("xiaoYang", modelId),
});
const resumeParserModel = computed({
  get: () => aiStore.getAgentModelId("resumeParser"),
  set: (modelId: string) => aiStore.setAgentModel("resumeParser", modelId),
});

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
    <div class="flex flex-wrap items-center justify-center gap-3">
      <label class="flex min-w-[180px] flex-1 items-center justify-center gap-3">
        <span class="shrink-0 text-xs font-bold text-sf-text-2">小舟</span>
        <SfSelect
          v-model="xiaoZhouModel"
          :list="modelOptions"
          class="min-w-0"
          placeholder="请选择模型"
        />
      </label>
      <label class="flex min-w-[180px] flex-1 items-center justify-center gap-3">
        <span class="shrink-0 text-xs font-bold text-sf-text-2">小羊</span>
        <SfSelect
          v-model="xiaoYangModel"
          :list="modelOptions"
          class="min-w-0"
          placeholder="请选择模型"
        />
      </label>
      <label class="flex min-w-[180px] flex-1 items-center justify-center gap-3">
        <span class="shrink-0 text-xs font-bold text-sf-text-2">简历解析</span>
        <SfSelect
          v-model="resumeParserModel"
          :list="modelOptions"
          class="min-w-0"
          placeholder="请选择模型"
        />
      </label>
    </div>
    <SfTab :list="tabList" v-model="modelManagerTab" v-model:index="activeIndex" />
    <div v-show="modelManagerTab === 'added'" class="flex min-h-0 flex-1 flex-col">
      <AddedModels class="h-full" @jump-add="jumpToAdd" />
    </div>
    <div v-show="modelManagerTab === 'add'" class="flex min-h-0 flex-1 flex-col">
      <AddModel class="h-full" @add-success="jumpToAdded" />
    </div>
  </div>
</template>
