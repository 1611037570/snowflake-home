<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";

// 设置弹窗可见性
const drawerVisible = ref(false);

const resumeStore = useResumeStore();
const { toolbarAlwaysVisible } = storeToRefs(resumeStore);
</script>

<template>
  <!-- 设置按钮 -->
  <SfTooltip content="系统设置" placement="left">
    <SfIcon
      icon="iconamoon:settings-fill"
      size="5"
      boxSize="7"
      class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
      @click="drawerVisible = true"
    />
  </SfTooltip>

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
