<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAiStore } from "@/stores";
import DefaultTab from "./defaultTab.vue";
import CustomTab from "./customTab.vue";
import Icon from "../../components/icon.vue";

// 设置弹窗可见性
const drawerVisible = ref(false);

// 使用 ai store
const aiStore = useAiStore();
const { activeModel } = storeToRefs(aiStore);

// 左侧服务商列表：雪花服务 + openai + ark + deepseek
const providerList = [
  { id: "snowflake", name: "雪花服务" },
  { id: "openai", name: "openai" },
  { id: "ark", name: "ark" },
  { id: "deepseek", name: "deepseek" },
];

// 当前查看的服务商（仅用于UI展示，不改变激活状态）
const viewingProvider = ref("snowflake");

// 选中服务商（仅切换查看，不改变激活状态）
function selectProvider(item) {
  viewingProvider.value = item.id;
}

// 获取是否为当前激活的服务商
function isActive(id) {
  return activeModel.value === id;
}

// 监听 activeModel 变化，更新服务商列表的 active 标记
watch(
  () => activeModel.value,
  () => {
    providerList.forEach((item) => {
      item.active = isActive(item.id);
    });
  },
);

// 初始化服务商列表的 active 标记
providerList.forEach((item) => {
  item.active = isActive(item.id);
});

// 监听弹窗打开，重置为当前激活的服务商
watch(
  () => drawerVisible.value,
  (visible) => {
    if (visible) {
      viewingProvider.value = providerList.find((item) => item.active)?.id || "snowflake";
    }
  },
);
</script>

<template>
  <Icon content="服务商设置" icon="lucide:sparkles" @click="drawerVisible = true" size="4.5" />

  <!-- 设置弹窗 -->
  <SfModal v-model="drawerVisible" title="服务商设置" width="640px">
    <div class="flex h-[440px] gap-4 p-4">
      <!-- 左侧：服务商列表 -->
      <div class="flex w-44 shrink-0 flex-col gap-3">
        <SfList
          :list="providerList"
          active-key="id"
          :active-value="viewingProvider"
          @onClick="selectProvider"
        />
      </div>
      <!-- 右侧：配置详情 -->
      <div class="flex-1 overflow-y-auto rounded-3xl border border-sf-b bg-sf-primary p-4">
        <DefaultTab v-if="viewingProvider === 'snowflake'" />
        <CustomTab v-else :provider="viewingProvider" />
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
