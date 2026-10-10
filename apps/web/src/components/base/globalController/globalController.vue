<script setup>
// 直接引用系统 store 模块，绕过 @/stores 桶文件以免拉入全部业务 store
import { useSystemStore } from "@/stores/modules/system";
defineOptions({ name: "SfGlobalController" });
const systemStore = useSystemStore();
const { monitorWatch } = storeToRefs(systemStore);
</script>

<template>
  <div>
    <!-- 监控器 -->
    <SfMonitor v-if="monitorWatch" />
  </div>
</template>

<style lang="scss" scoped></style>
