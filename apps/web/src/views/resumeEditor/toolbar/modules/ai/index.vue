<script setup>
import { computed, ref } from "vue";
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

// 左侧服务商列表：雪花服务 + openai + ark
const providerList = [
  { id: "snowflake", name: "雪花服务" },
  { id: "openai", name: "openai" },
  { id: "ark", name: "ark" },
];

// 展示用激活项：激活配置失效时回退雪花服务
const currentActive = computed(() =>
  providerList.some((item) => item.id === activeModel.value)
    ? activeModel.value
    : "snowflake",
);

// 选中服务商
function selectProvider(item) {
  activeModel.value = item.id;
}
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
          :active-value="currentActive"
          @onClick="selectProvider"
        />
      </div>
      <!-- 右侧：配置详情 -->
      <div class="flex-1 overflow-y-auto rounded-3xl border border-sf-b bg-sf-primary p-4">
        <DefaultTab v-if="currentActive === 'snowflake'" />
        <CustomTab v-else :provider="currentActive" />
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
