<template>
  <ElProgress
    v-if="isLoading"
    class="sf-top-loading pointer-events-none w-full"
    :percentage="100"
    :indeterminate="true"
    :duration="2"
    :show-text="false"
    :stroke-width="2"
    color="var(--sf-theme)"
  />
</template>

<script setup lang="ts">
import { ElProgress } from "element-plus";
import { routeLoading } from "@/utils/modules/routeLoading";

defineOptions({ name: "SfTopLoading" });

const isLoading = routeLoading;
</script>

<style scoped>
.sf-top-loading {
  position: fixed !important;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  margin: 0;
  pointer-events: none;
}

:deep(.el-progress-bar__outer),
:deep(.el-progress-bar__inner) {
  border-radius: 0;
}

:deep(.el-progress-bar__outer) {
  background-color: transparent;
}
</style>
