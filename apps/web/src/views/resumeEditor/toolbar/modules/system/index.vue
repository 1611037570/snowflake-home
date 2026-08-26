<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import Icon from "../../components/icon.vue";

// 设置弹窗可见性
const drawerVisible = ref(false);

const resumeStore = useResumeStore();
const { system } = storeToRefs(resumeStore);
</script>

<template>
  <!-- 设置按钮 -->
  <Icon icon="iconamoon:settings-fill" content="系统设置" @click="drawerVisible = true" />

  <!-- 设置弹窗 -->
  <SfModal v-model="drawerVisible" title="系统设置">
    <div class="flex w-[400px] flex-col gap-5 p-4">
      <SfSetBox>
        <SfSetItem
          title="工具栏常驻"
          info="开启后，工具栏会常驻在页面顶部，不随内容滚动"
          v-model="system.toolbarAlwaysVisible"
          type="switch"
        />
        <SfSetItem
          title="显示进度条"
          info="开启后，显示进度条"
          v-model="system.showProgress"
          type="switch"
        />
      </SfSetBox>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
