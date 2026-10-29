<script setup lang="ts">
import { computed, inject, provide } from "vue";
import { storeToRefs } from "pinia";
import AddModel from "./addModel.vue";
import { useAiStore } from "@/stores";
import { PROVIDER_NAMES } from "@/configs";
import { SF_ICON_LIST_KEY } from "@/components/base/icon";
import { AI_BRAND_ICONS, getProviderIcon } from "./providerIcons";
import PencilIcon from "@iconify-vue/lucide/pencil";
import FileTextIcon from "@iconify-vue/lucide/file-text";
import SparklesIcon from "@iconify-vue/lucide/sparkles";

const aiStore = useAiStore();
const { modelList } = storeToRefs(aiStore);

// 本地加载角色与服务商图标，同时保留编辑器已经注入的图标。
provide(SF_ICON_LIST_KEY, {
  ...inject(SF_ICON_LIST_KEY, {}),
  ...AI_BRAND_ICONS,
  "lucide:pencil": PencilIcon, // 文字助手角色图标。
  "lucide:file-text": FileTextIcon, // 文档解析角色图标。
  "lucide:sparkles": SparklesIcon, // 面试辅导角色及其他服务商图标。
});

const agentCards: Array<{
  // 角色使用的稳定标识。
  key: "xiaoZhou" | "xiaoYang" | "resumeParser";
  // 角色展示名称。
  name: string;
  // 角色的主要用途。
  description: string;
  // 项目中已登记的角色图标。
  icon: string;
}> = [
  {
    key: "xiaoZhou",
    name: "小舟",
    description: "日常交流 · 内容润色 · Markdown 导入",
    icon: "lucide:pencil",
  },
  {
    key: "resumeParser",
    name: "简历解析",
    description: "PDF 导入 · 页面识别与内容提取",
    icon: "lucide:file-text",
  },
  {
    key: "xiaoYang",
    name: "小羊",
    description: "模拟面试 · 回答辅导与表达练习",
    icon: "lucide:sparkles",
  },
];

// 角色选择器展示已添加的模型配置
const modelOptions = computed(() =>
  modelList.value.map((model) => ({
    value: model.id,
    name: model.name || model.model || PROVIDER_NAMES[model.provider] || model.provider,
    providerName: model.builtin
      ? "雪花服务"
      : model.provider === "ark"
        ? "豆包"
        : PROVIDER_NAMES[model.provider] || model.provider, // 选择栏右侧的服务商名称。
    icon: getProviderIcon(model.provider, model.builtin, model.model), // 当前选中项与下拉选项共用的品牌图标。
  })),
);

// 卡片展示直接从当前绑定派生，切换或删除模型后同步刷新。
const agentViews = computed(() =>
  agentCards.map((agent) => ({
    ...agent,
    selectedModel: modelOptions.value.find((model) => model.value === getAgentModel(agent.key)), // 当前角色选中的模型及展示信息。
  })),
);

const boundCount = computed(() => agentCards.filter((agent) => getAgentModel(agent.key)).length);
// 模型库直接展示当前角色分配，复用上方角色声明而不再维护一份名称表。
const modelBindings = computed<Record<string, string[]>>(() =>
  Object.fromEntries(
    modelList.value.map((model) => [
      model.id,
      agentCards
        .filter((agent) => getAgentModel(agent.key) === model.id)
        .map((agent) => agent.name),
    ]),
  ),
);
// 统一读写角色绑定模型，卡片只负责展示与选择
function getAgentModel(agent: (typeof agentCards)[number]["key"]) {
  return aiStore.getAgentModelId(agent);
}

function setAgentModel(agent: (typeof agentCards)[number]["key"], modelId: string) {
  aiStore.setAgentModel(agent, modelId);
}
provide("bg", "bg-sf-primary");
</script>

<template>
  <div class="flex min-w-0 flex-col gap-3">
    <!-- 角色绑定保留在上方，服务商与模型管理在同一界面直接展示。 -->
    <section class="shrink-0">
      <header class="mb-3 flex items-center justify-between gap-3">
        <h2 class="text-sm font-semibold text-sf-text">角色模型</h2>
        <span class="text-xs text-sf-text-2">已配置 {{ boundCount }}/3</span>
      </header>
      <div
        class="grid grid-cols-[repeat(3,minmax(228px,1fr))] gap-3 overflow-x-auto pb-[3px] sm:grid-cols-3 sm:overflow-visible"
      >
        <article
          v-for="agent in agentViews"
          :key="agent.key"
          class="agent-card flex min-w-0 flex-col gap-[9px] rounded-3xl border bg-sf-primary p-3 transition-colors"
        >
          <header class="flex min-w-0 items-start gap-3">
            <span
              class="agent-role-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-sf-bg text-sf-text-2"
            >
              <SfIcon :icon="agent.icon" size="5" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex min-w-0 items-center justify-between gap-[6px]">
                <h3 class="truncate text-base leading-6 font-semibold text-sf-text">
                  {{ agent.name }}
                </h3>
                <span
                  v-if="agent.selectedModel"
                  class="agent-bound-badge inline-flex shrink-0 items-center gap-[6px] rounded-full border px-[9px] py-[3px] text-[10px] leading-3 font-medium"
                >
                  <span class="h-[6px] w-[6px] rounded-full bg-current"></span>
                  已配置
                </span>
              </div>
              <!-- 说明保持单行，不再预留第二行空白撑高卡片。 -->
              <p class="mt-[3px] truncate text-xs leading-[18px] text-sf-text-2">
                {{ agent.description }}
              </p>
            </div>
          </header>
          <!-- 保留原有选择器交互，用独立底栏突出当前模型与服务商。 -->
          <div class="relative">
            <SfSelect
              :model-value="getAgentModel(agent.key)"
              :list="modelOptions"
              class="agent-model-select w-full flex-none!"
              :class="{ 'agent-model-select--bound': agent.selectedModel }"
              :aria-label="`为${agent.name}选择模型`"
              :placeholder="modelOptions.length ? '未选择模型' : '先添加模型'"
              clearable
              :disabled="!modelOptions.length"
              @update:model-value="setAgentModel(agent.key, $event)"
            >
              <template v-if="agent.selectedModel" #prefix>
                <span class="flex h-6 w-6 shrink-0 items-center justify-center text-sf-text">
                  <SfIcon :icon="agent.selectedModel.icon" size="5" />
                </span>
              </template>
            </SfSelect>
            <span
              v-if="agent.selectedModel"
              class="agent-provider-badge pointer-events-none absolute top-1/2 right-9 max-w-[72px] -translate-y-1/2 truncate rounded-full bg-sf-bg-2 px-[6px] py-[3px] text-[10px] leading-3 text-sf-text-2"
            >
              {{ agent.selectedModel.providerName }}
            </span>
          </div>
        </article>
      </div>
    </section>
    <!-- 不再切换模型库与添加页面，添加模型由服务商工作区的弹窗承接。 -->
    <AddModel :bindings="modelBindings" />
  </div>
</template>

<style scoped>
/* 卡片使用主要底色，图标和选择栏使用次级底色，明暗主题均保持层次。 */
.agent-card {
  container-type: inline-size;
}

.agent-card,
.agent-role-icon {
  border-color: var(--color-sf-b);
}

.agent-card:hover {
  border-color: var(--color-sf-text-3);
}

.agent-bound-badge {
  color: var(--color-sf-success);
  border-color: var(--color-sf-success-2);
  background-color: var(--color-sf-success-2);
}

/* 样式只作用于角色模型栏，保留 SfSelect 的键盘选择与清空能力。 */
.agent-model-select :deep(.el-select__wrapper) {
  min-height: 42px;
  gap: 9px;
  padding: 6px 9px;
  border: 1px solid var(--color-sf-b);
  border-radius: 12px;
  background-color: var(--color-sf-bg);
  box-shadow: none;
}

.agent-model-select :deep(.el-select__wrapper.is-hovering),
.agent-model-select :deep(.el-select__wrapper.is-focused) {
  border-color: var(--color-sf-theme);
}

.agent-model-select :deep(.el-select__selected-item) {
  font-size: 13px;
  font-weight: 500;
}

/* 为服务商徽标预留空间，不覆盖模型文字或原有的清空、展开按钮。 */
.agent-model-select--bound :deep(.el-select__selection) {
  padding-right: 78px;
}

/* 弹窗和窄屏优先留出模型名称空间，服务商品牌图标仍然保留。 */
@container (max-width: 252px) {
  .agent-provider-badge {
    display: none;
  }

  .agent-model-select--bound :deep(.el-select__selection) {
    padding-right: 0;
  }
}
</style>
