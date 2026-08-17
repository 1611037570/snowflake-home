<script setup>
import { storeToRefs } from "pinia";
import { useSystemStore } from "@/stores/modules/system";
import { useAiStore } from "@/stores/modules/ai";

const systemStore = useSystemStore();
const { isConnected } = storeToRefs(systemStore);

const aiStore = useAiStore();
const { activeService } = storeToRefs(aiStore);

// 是否为当前激活的服务
const isActive = () => activeService.value === "snowflake";

// 使用该服务
function useService() {
  aiStore.activeService = "snowflake";
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        雪花服务<el-tag :type="isConnected ? 'success' : 'info'">{{
          isConnected ? "已连接" : "未连接"
        }}</el-tag>
      </div>
      <div>余额：10000000000000000000000000000000</div>
    </div>
    <!-- 使用该服务按钮 -->
    <el-button type="primary" class="w-full" :disabled="isActive()" @click="useService">
      {{ isActive() ? "已选择" : "使用该服务" }}
    </el-button>
  </div>
</template>
