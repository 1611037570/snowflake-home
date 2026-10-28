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
    <Icon content="AI 设置" icon="lucide:sparkles" :active="modelManagerVisible" />
  </div>
  <!-- 设置弹窗使用次级底色，与内部主要底色的角色卡片区分层次。 -->
  <SfModal v-model="modelManagerVisible" title="AI 设置" width="840px" bg-class="bg-sf-bg">
    <!-- 视口不足时由弹窗外层整体滚动，避免添加表单内部出现滚动条。 -->
    <div class="h-[min(660px,calc(90svh-84px))] overflow-y-auto">
      <ProviderSettingsContent />
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
