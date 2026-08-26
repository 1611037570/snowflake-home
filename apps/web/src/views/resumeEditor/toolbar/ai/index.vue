<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useAiStore } from "@/stores";
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
  <SfTooltip content="助手设置">
    <SfIcon
      icon="iconamoon:settings-fill"
      size="5"
      boxSize="7"
      class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
      @click="drawerVisible = true"
    />
  </SfTooltip>

  <!-- 设置弹窗 -->
  <SfModal v-model="drawerVisible" title="助手设置">
    <div class="flex w-[400px] flex-col gap-5 p-4">
      <div>
        <div class="mb-3">服务商</div>
        <SfTab :list="list" v-model="currentactiveModel">
          <SfTabPane value="snowflake">
            <DefaultTab />
          </SfTabPane>
          <SfTabPane value="custom">
            <CustomTab />
          </SfTabPane>
        </SfTab>
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
