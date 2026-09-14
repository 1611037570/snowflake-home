<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import AddedModels from "./addedModels.vue";
import AddModel from "./addModel.vue";
import { useAiStore } from "@/stores";
import { PROVIDER_NAMES } from "@/configs";

const aiStore = useAiStore();
const { modelManagerTab, modelList } = storeToRefs(aiStore);

const agentCards: Array<{
  key: "xiaoZhou" | "xiaoYang" | "resumeParser";
  name: string;
  description: string;
  icon: string;
}> = [
  {
    key: "xiaoZhou",
    name: "小舟",
    description: "简历优化 · ATS 关键词匹配",
    icon: "mdi:robot-outline",
  },
  {
    key: "xiaoYang",
    name: "小羊",
    description: "简历助手 · 智能对话",
    icon: "mdi:robot-excited-outline",
  },
  {
    key: "resumeParser",
    name: "简历解析",
    description: "识别内容 · 提取字段",
    icon: "mdi:file-document-outline",
  },
];

// 角色选择器展示已添加的模型配置
const modelOptions = computed(() =>
  modelList.value.map((model) => ({
    value: model.id,
    name: model.name || model.model || PROVIDER_NAMES[model.provider] || model.provider,
  })),
);

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

// 统一读写角色绑定模型，卡片只负责展示与选择
function getAgentModel(agent: (typeof agentCards)[number]["key"]) {
  return aiStore.getAgentModelId(agent);
}

function setAgentModel(agent: (typeof agentCards)[number]["key"], modelId: string) {
  aiStore.setAgentModel(agent, modelId);
}
</script>

<template>
  <div class="flex h-full flex-col gap-3">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div
        v-for="agent in agentCards"
        :key="agent.key"
        class="flex min-w-0 flex-col gap-3 rounded-3xl border border-sf-b bg-sf-transparent p-3"
      >
        <div class="flex min-w-0 items-center gap-3">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sf-bg-3">
            <SfIcon :icon="agent.icon" size="6" class="cursor-default text-sf-text-2" />
          </div>
          <div class="min-w-0">
            <div class="truncate text-base font-bold text-sf-text">{{ agent.name }}</div>
            <div class="mt-3 truncate text-xs text-sf-text-3">{{ agent.description }}</div>
          </div>
        </div>

        <div class="flex h-12 items-center rounded-3xl border border-sf-b px-3">
          <SfSelect
            :model-value="getAgentModel(agent.key)"
            :list="modelOptions"
            class="model-select w-full"
            placeholder="未选择模型"
            @update:model-value="setAgentModel(agent.key, $event)"
          />
        </div>

        <div class="flex min-h-3 items-center gap-3 text-xs">
          <template v-if="!modelList.length">
            <SfIcon icon="lucide:sparkles" size="4" class="cursor-default text-sf-theme" />
            <button type="button" class="text-sf-theme hover:underline" @click="jumpToAdd">
              先添加模型
            </button>
          </template>
          <span v-else-if="getAgentModel(agent.key)" class="text-sf-text-3">已绑定模型</span>
          <span v-else class="text-sf-text-3">请选择一个模型</span>
        </div>
      </div>
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
