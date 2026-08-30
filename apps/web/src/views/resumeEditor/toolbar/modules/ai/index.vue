<script setup>
import { ref } from "vue";
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
  <Icon content="AI助手设置" icon="lucide:sparkles" @click="drawerVisible = true" size="4.5" />

  <!-- 设置弹窗 -->
  <SfModal v-model="drawerVisible" title="AI助手设置">
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
