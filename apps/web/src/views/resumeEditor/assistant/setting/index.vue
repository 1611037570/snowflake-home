<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useAiStore } from "@/stores/modules/ai";
import DefaultTab from "./defaultTab.vue";
import CustomTab from "./customTab.vue";

// 设置弹窗可见性
const drawerVisible = ref(false);

// 使用 ai store
const aiStore = useAiStore();
const { activeModel } = storeToRefs(aiStore);

const list = [
  {
    name: "默认",
    value: "snowflake",
  },
  {
    name: "自定义",
    value: "custom",
  },
];

const currentactiveModel = ref(activeModel.value);
</script>

<template>
  <!-- 设置按钮 -->
  <div
    class="flex-c h-9 w-16 cursor-pointer rounded-lg border border-sf-b/50 bg-sf-primary text-sm text-sf-text hover:border-sf-theme"
    @click="drawerVisible = true"
  >
    设置
  </div>

  <!-- 设置弹窗 -->
  <SfModal v-model="drawerVisible" title="助手设置">
    <div class="flex w-[400px] flex-col gap-5 p-4">
      <SfTab :list="list" v-model="currentactiveModel">
        <SfTabPane value="snowflake">
          <DefaultTab />
        </SfTabPane>
        <SfTabPane value="custom">
          <CustomTab />
        </SfTabPane>
      </SfTab>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
