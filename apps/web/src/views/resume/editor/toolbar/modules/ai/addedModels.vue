<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import confirm from "@/components/business/confirm";
import { PROVIDER_NAMES } from "@/configs";
import { useAiStore } from "@/stores/modules/ai";
import { LLM } from "@/apis";
import { getProviderIcon } from "./providerIcons";

const emit = defineEmits<{ jumpAdd: [] }>();
const props = defineProps<{
  // 每个模型当前绑定的角色名称，由角色区统一提供。
  bindings: Record<string, string[]>;
}>();

const aiStore = useAiStore();
const { modelList } = storeToRefs(aiStore);
const balanceMap = ref<Record<string, string>>({});
const balanceLoading = ref<Record<string, boolean>>({});
// 每个已添加模型独立记录连接结果，重复测试时覆盖上次状态。
const connectionStates = ref<Record<string, {
  // 当前连接测试阶段。
  status: "testing" | "success" | "error";
  // 当前阶段的提示或失败原因。
  message: string;
}>>({});

// 列表数据：已添加模型（雪花服务作为普通条目添加后同样展示于此）
const displayList = computed(() =>
  modelList.value.map((m: any) => ({
    id: m.id,
    name: m.name || m.model || PROVIDER_NAMES[m.provider] || m.provider,
    provider: m.provider,
    providerIcon: getProviderIcon(m.provider, m.builtin, m.model), // 与角色选择栏共用同一品牌标识。
    model: m.model,
    key: m.key,
    url: m.url,
    protocol: m.protocol === "responses" ? "responses" : "chatCompletions",
    balanceSupported: !m.builtin && m.name !== "雪花服务" && ["openai", "deepseek", "ark"].includes(m.provider), // 新增服务商没有余额接口时不展示查询按钮。
    bindings: props.bindings[m.id] ?? [], // 当前使用该模型的角色名称。
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

// 复用添加时的统一连接检测，使用该模型保存的地址、密钥和协议。
async function testConnection(item: any) {
  if (connectionStates.value[item.id]?.status === "testing") return;
  connectionStates.value[item.id] = {
    status: "testing",
    message: "正在测试连接…",
  };
  try {
    const llm = new LLM({
      url: item.url,
      apiKey: item.key,
      provider: item.provider,
      model: item.model,
      protocol: item.protocol,
    });
    await llm.ping();
    // 测试期间删除的模型不再更新结果。
    if (!modelList.value.some((model) => model.id === item.id)) return;
    connectionStates.value[item.id] = {
      status: "success",
      message: "连接成功",
    };
  } catch (error: any) {
    if (!modelList.value.some((model) => model.id === item.id)) return;
    connectionStates.value[item.id] = {
      status: "error",
      message: error?.message || "连接失败，请检查模型配置后重试",
    };
  }
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

// 删除确认使用统一 Sf 弹窗，确认后再移除模型及其角色绑定。
function removeModel(item: any) {
  confirm("确定要删除该模型吗？此操作不可恢复。", "删除模型", {
    confirmText: "删除", // 明确确认按钮对应的操作。
    cancelText: "取消", // 取消时保留模型配置。
  })
    .then(() => {
      aiStore.deleteModel(item.id);
    })
    .catch(() => {});
}
</script>

<template>
  <!-- 空态：暂无已添加模型时提示去添加 -->
  <div v-if="!displayList.length" class="flex h-full flex-col items-center justify-center gap-3 rounded-xl bg-sf-bg p-3 text-center">
    <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sf-theme-3 text-sf-theme">
      <SfIcon icon="lucide:sparkles" size="6" />
    </span>
    <h3 class="text-sm font-semibold text-sf-text">先添加一个模型</h3>
    <p class="max-w-sm text-xs leading-5 text-sf-text-2">可直接添加内置服务，也可以接入自己的服务商。添加后，在上方为角色选择使用的模型。</p>
    <SfButton class="gap-[6px]" @click="emit('jumpAdd')">
      <SfIcon icon="ic:round-add" size="4" />
      添加第一个模型
    </SfButton>
  </div>

  <!-- 模型条目使用主要底色，与模型库底色区分，说明文字保持可读对比。 -->
  <SfScrollbar v-else flush class="min-h-0 flex-1">
    <div class="flex flex-col gap-3">
      <article v-for="item in displayList" :key="item.id" class="shrink-0 rounded-xl border border-sf-b bg-sf-primary p-3">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center text-sf-text">
            <SfIcon :icon="item.providerIcon" size="6" />
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-semibold text-sf-text">{{ item.name }}</h3>
            <p class="mt-[3px] truncate text-xs text-sf-text-2">
              {{ PROVIDER_NAMES[item.provider] || item.provider }} · {{ item.model }}
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-3">
            <SfButton
              type="bg"
              size="small"
              class="shrink-0 gap-[6px]"
              :disabled="connectionStates[item.id]?.status === 'testing'"
              :aria-busy="connectionStates[item.id]?.status === 'testing'"
              @click="testConnection(item)"
            >
              <SfIcon v-if="connectionStates[item.id]?.status === 'testing'" icon="line-md:loading-twotone-loop" size="3" />
              {{ connectionStates[item.id]?.status === "testing" ? "测试中" : "测试连接" }}
            </SfButton>
            <button
              v-if="item.balanceSupported"
              type="button"
              class="inline-flex cursor-pointer items-center gap-[6px] rounded-xl bg-sf-bg px-3 py-[6px] text-xs text-sf-text-2 transition-colors hover:bg-sf-theme-3 disabled:cursor-wait disabled:opacity-60"
              :disabled="balanceLoading[item.id]"
              :aria-busy="balanceLoading[item.id]"
              @click="queryBalance(item)"
            >
              <SfIcon v-if="balanceLoading[item.id]" icon="line-md:loading-twotone-loop" size="3" />
              {{ balanceLoading[item.id] ? "查询中" : "查询余额" }}
            </button>
            <button
              type="button"
              class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-xl text-sf-text-3 transition-colors hover:bg-sf-error-2 hover:text-sf-error"
              :aria-label="`删除模型 ${item.name}`"
              @click="removeModel(item)"
            >
              <SfIcon icon="lucide:trash-2" size="4" />
            </button>
          </div>
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-[6px]">
          <span v-for="name in item.bindings" :key="name" class="rounded-full bg-sf-theme-3 px-3 py-[3px] text-[11px] text-sf-theme">{{ name }}</span>
          <span v-if="!item.bindings.length" class="text-xs text-sf-text-2">暂未分配给角色</span>
          <span v-if="balanceMap[item.id]" class="ml-auto text-xs text-sf-text-2">余额：{{ balanceMap[item.id] }}</span>
        </div>
        <p
          v-if="connectionStates[item.id]"
          role="status"
          class="mt-3 text-xs leading-5 break-words"
          :class="connectionStates[item.id].status === 'success' ? 'text-sf-success' : connectionStates[item.id].status === 'error' ? 'text-sf-error' : 'text-sf-text-3'"
        >
          {{ connectionStates[item.id].message }}
        </p>
      </article>
    </div>
  </SfScrollbar>
</template>
