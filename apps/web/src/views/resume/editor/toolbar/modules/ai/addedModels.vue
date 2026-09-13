<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage, ElMessageBox } from "element-plus";
import { PROVIDER_NAMES } from "@/configs";
import { useAiStore } from "@/stores/modules/ai";
import { LLM } from "@/apis";

const emit = defineEmits<{ jumpAdd: [] }>();

const aiStore = useAiStore();
const { activeModel, modelList } = storeToRefs(aiStore);
const balanceMap = ref<Record<string, string>>({});
const balanceLoading = ref<Record<string, boolean>>({});

// 列表数据：已添加模型（雪花服务作为普通条目添加后同样展示于此）
const displayList = computed(() =>
  modelList.value.map((m: any) => ({
    id: m.id,
    name: m.name || m.model || PROVIDER_NAMES[m.provider] || m.provider,
    provider: m.provider,
    model: m.model,
    key: m.key,
    url: m.url,
    protocol: m.protocol === "responses" ? "responses" : "chatCompletions",
    balanceSupported: !m.builtin && m.name !== "雪花服务" && m.provider !== "snowflake",
    // active: activeModel.value === m.id,
  })),
);

// 格式化不同供应商的余额响应
function formatBalance(item: any, data: any) {
  if (item.provider === "deepseek") {
    const balances = (data.balance_infos || [])
      .map((balance: any) => `${balance.currency} ${balance.total_balance}`)
      .join(" / ");
    return balances || "暂无余额";
  }
  if (item.provider === "ark") {
    return data?.Result?.AvailableBalance ?? data?.result?.AvailableBalance ?? "暂无余额";
  }
  return data?.total_available ?? data?.totalAvailable ?? "暂无余额";
}

// 查询已添加模型的账户余额
async function queryBalance(item: any) {
  if (!item.balanceSupported || balanceLoading.value[item.id]) return;
  balanceLoading.value[item.id] = true;
  try {
    const llm = new LLM({
      url: item.url,
      apiKey: item.key,
      provider: item.provider,
      model: item.model,
      protocol: item.protocol,
    });
    const data = await llm.getBalance();
    const balance = formatBalance(item, data);
    balanceMap.value[item.id] = balance;
    ElMessage.success(`当前余额：${balance}`);
  } catch (error: any) {
    ElMessage.error(error?.message || "查询余额失败");
  } finally {
    balanceLoading.value[item.id] = false;
  }
}

// 点击模型：切换为当前使用模型
function selectModel(item: any) {
  aiStore.activeModel = item.id;
}

// 行内删除已添加的模型（激活项删除后 store 会自动回退雪花服务）
function removeModel(item: any) {
  ElMessageBox.confirm("确定要删除该模型吗？此操作不可恢复。", "删除模型", {
    type: "warning",
  })
    .then(() => {
      aiStore.deleteModel(item.id);
    })
    .catch(() => {});
}
</script>

<template>
  <!-- 空态：暂无已添加模型时提示去添加 -->
  <div v-if="!displayList.length" class="flex h-full flex-col items-center justify-center gap-3">
    <span class="text-sm text-sf-text-3">还没有已添加的模型</span>
    <el-button type="primary" @click="emit('jumpAdd')">去添加</el-button>
  </div>

  <!-- 模型列表：点击切换当前使用，行内提供删除 -->
  <SfList v-else :list="displayList" @onClick="selectModel">
    <template #default="{ item }">
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <span class="truncate">{{ item.name }}</span>
        <span v-if="activeModel === item.id" class="text-sf-theme">已选中</span>
      </div>

      <div class="flex shrink-0 items-center gap-3">
        <span v-if="balanceMap[item.id]" class="text-xs text-sf-text-3">
          {{ balanceMap[item.id] }}
        </span>
        <el-button
          v-if="item.balanceSupported"
          link
          type="primary"
          size="small"
          :loading="balanceLoading[item.id]"
          @mousedown.stop
          @click.stop="queryBalance(item)"
        >
          查询余额
        </el-button>
      </div>

      <span
        title="删除该模型"
        class="shrink-0 cursor-pointer text-sf-text-3 hover:text-red-500"
        @mousedown.stop
        @click.stop="removeModel(item)"
      >
        <SfIcon icon="lucide:trash-2" size="3.5" />
      </span>
    </template>
  </SfList>
</template>
