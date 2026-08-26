<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import Icon from "../components/icon.vue";

// 设置弹窗可见性
const drawerVisible = ref(false);

const resumeStore = useResumeStore();
const { toolbarAlwaysVisible } = storeToRefs(resumeStore);
</script>

<template>
  <!-- 设置按钮 -->
  <Icon icon="iconamoon:settings-fill" content="系统设置" @click="drawerVisible = true" />

  <!-- 设置弹窗 -->
  <SfModal v-model="drawerVisible" title="系统设置">
    <div class="flex w-[400px] flex-col gap-5 p-4">
      <div class="flex items-center justify-between rounded-xl bg-sf-bg-2 px-3 py-2">
        <span class="text-sm text-sf-text">工具栏常驻</span>
        <el-switch v-model="toolbarAlwaysVisible" />
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
