<script setup lang="ts">
import { storeToRefs } from "pinia";
import Icon from "../../components/icon.vue";
import ProviderSettingsContent from "./content.vue";
import { useAiStore } from "@/stores";

const aiStore = useAiStore();
const { modelManagerVisible, modelManagerTab } = storeToRefs(aiStore);

// 打开弹窗：重置到第一个 Tab
function openDrawer() {
  modelManagerTab.value = "added";
  modelManagerVisible.value = true;
}
</script>

<template>
  <div class="cursor-pointer text-sf-text hover:text-sf-theme" @click="openDrawer">
    <Icon content="服务商设置" icon="lucide:sparkles" />
  </div>

  <!-- 设置弹窗 -->
  <SfModal v-model="modelManagerVisible" title="服务商设置" width="640px">
    <ProviderSettingsContent class="h-[460px]" />
  </SfModal>
</template>

<style lang="scss" scoped></style>
