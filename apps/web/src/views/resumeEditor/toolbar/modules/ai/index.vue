<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAiStore } from "@/stores/modules/ai";
import ChildComponent from "./customTab.vue";
import Icon from "../../components/icon.vue";

// 设置弹窗可见性
const drawerVisible = ref(false);

// 使用 ai store
const aiStore = useAiStore();
const { activeModel, modelList, customModelList } = storeToRefs(aiStore);

// 当前查看的模型 ID（snowflake 表示雪花服务）
const viewingId = ref("snowflake");
// 当前查看的模型数据
const currentViewingModel = ref<any>(null);

// 是否为初始化状态（首次添加新模型，跳过表单验证）
const isInitializing = ref(false);

// 左侧服务商列表（固定模板，用于"添加模型"入口）
const providerTemplates = [
  { id: "openai", name: "OpenAI" },
  { id: "ark", name: "火山方舟 Ark" },
  { id: "deepseek", name: "DeepSeek" },
];

// 已激活标记
providerTemplates.forEach((item) => {
  (item as any).active = activeModel.value === item.id;
});

// 监听 activeModel 变化，更新激活标记
watch(
  () => activeModel.value,
  () => {
    providerTemplates.forEach((item) => {
      (item as any).active = activeModel.value === item.id;
    });
  },
);

// 点击"添加模型"按钮时打开弹窗
function handleAddModel() {
  if (!drawerVisible.value) {
    drawerVisible.value = true;
  }
}

// 关闭弹窗后重置视图
function closeDrawer() {
  viewingId.value = "snowflake";
  currentViewingModel.value = null;
  isInitializing.value = false;
}

// ========== 事件处理 ==========

/** 选中已添加的模型 */
function selectModel(model: any) {
  viewingId.value = model.id;
  currentViewingModel.value = model;
  isInitializing.value = false;
}

/** 选择可添加的服务商 */
function selectProvider(provider: any) {
  isInitializing.value = true;
  viewingId.value = `pending-${provider.id}`;
  currentViewingModel.value = null;
}

/** 保存 / 添加模型 */
function handleSave(data: { name: string; model: string; key: string; url: string; provider: string }) {
  // 通过 store 部署到新模型列表
  const deployed = aiStore.deployModel({
    provider: data.provider,
    name: data.name,
    model: data.model,
    key: data.key,
    url: data.url,
  });
  ElMessage.success(data.name ? "模型保存成功" : "模型添加成功");
  viewingId.value = deployed.id;
  currentViewingModel.value = deployed;
  isInitializing.value = false;
}

/** 取消操作 */
function handleCancel() {
  // 如果是草稿模式且尚未部署，清除草稿
  if (isInitializing.value && viewingId.value.startsWith("pending-")) {
    const provider = viewingId.value.replace("pending-", "");
    const idx = customModelList.value.findIndex((item: any) => item.provider === provider);
    if (idx > -1) {
      customModelList.value.splice(idx, 1);
    }
  }
  viewingId.value = "snowflake";
  currentViewingModel.value = null;
  isInitializing.value = false;
}

/** 删除当前已添加的模型 */
function handleRemoveModel() {
  if (!currentViewingModel.value || !currentViewingModel.value.id) return;
  aiStore.deleteModel(currentViewingModel.value.id);
  viewingId.value = "snowflake";
  currentViewingModel.value = null;
  isInitializing.value = false;
}
</script>

<template>
  <div class="cursor-pointer text-sf-text hover:text-sf-theme" @click="handleAddModel">
    <Icon content="服务商设置" icon="lucide:sparkles" />
  </div>

  <!-- 设置弹窗 -->
  <SfModal v-model="drawerVisible" title="服务商设置" width="640px" @close="closeDrawer">
    <div class="flex h-[480px] gap-4 p-4">
      <!-- 左侧：已添加模型列表 + 添加入口 -->
      <div class="flex w-44 shrink-0 flex-col gap-3">
        <!-- 已添加模型列表 -->
        <div class="shrink-0">
          <div class="mb-2 text-xs font-bold text-sf-text-2">已添加模型</div>
          <SfList
            :list="modelList"
            active-key="id"
            :active-value="viewingId"
            @onClick="selectModel"
          />
        </div>
        <!-- 分隔线 -->
        <div class="my-1 h-[0.5px] w-full bg-sf-bg-3" />
        <!-- 添加服务商入口 -->
        <div>
          <div class="mb-2 text-xs font-bold text-sf-text-2">可添加服务商</div>
          <SfList
            :list="providerTemplates"
            active-key="id"
            :active-value="viewingId"
            @onClick="selectProvider"
          />
        </div>
      </div>

      <!-- 右侧：模型详情 / 添加表单 -->
      <ChildComponent
        :model-id="viewingId"
        :editing-model="currentViewingModel"
        :initializing="isInitializing"
        @save="handleSave"
        @cancel="handleCancel"
        @remove-current-model="handleRemoveModel"
      />
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
