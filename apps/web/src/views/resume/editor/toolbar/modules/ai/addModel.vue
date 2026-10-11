<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { useAiStore } from "@/stores/modules/ai";
import { LLM } from "@/apis";
import { snowflake } from "@/configs";

const emit = defineEmits<{ addSuccess: [] }>();

const aiStore = useAiStore();

// 服务商模板：preset 存在表示内置配置，无需表单填写即可一键添加
type ProviderTemplate = {
  // 服务商标识
  id: string;
  // 服务商展示名称
  name: string;
  // 是否使用内置配置
  builtin?: boolean;
  // 官方完整请求地址
  defaultUrl?: string;
  // 可直接添加的内置模型配置
  preset?: {
    // 请求使用的服务商标识
    provider: string;
    // 内置模型展示名称
    name: string;
    // 内置模型标识
    model: string;
    // 内置服务访问密钥
    key: string;
    // 内置服务完整请求地址
    url: string;
    // 内置服务请求协议
    protocol: "chatCompletions" | "responses";
  };
};

// 可添加的服务商模板：雪花服务使用内置配置，其余需手动填写表单
const providerTemplates: ProviderTemplate[] = [
  {
    id: "snowflake",
    name: "雪花服务",
    builtin: true,
    preset: {
      provider: snowflake.provider,
      name: "雪花服务",
      model: snowflake.model,
      key: snowflake.apiKey,
      url: snowflake.baseUrl,
      protocol: snowflake.protocol,
    },
  },
  { id: "openai", name: "OpenAI", defaultUrl: "https://api.openai.com/v1/chat/completions" },
  {
    id: "ark",
    name: "火山方舟 Ark",
    defaultUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
  },
  { id: "deepseek", name: "DeepSeek", defaultUrl: "https://api.deepseek.com/chat/completions" },
];
// 各服务商获取 Key 的链接
const keyLinks: Record<string, string> = {
  openai: "https://platform.openai.com/api-keys",
  ark: "https://console.volcengine.com/ark",
  deepseek: "https://platform.deepseek.com/",
};

// 服务商列表：雪花服务已添加后从列表移除，避免重复添加（删除后可再次添加）
const providerList = computed(() =>
  providerTemplates.filter((item) => {
    if (!item.preset) return true;
    return !aiStore.modelList.some((model) => model.provider === item.preset?.provider);
  }),
);

// 当前选中的服务商（默认选中第一个服务商）
const selectedProvider = ref(providerTemplates[0].id);
const currentProvider = computed(() =>
  providerTemplates.find((item) => item.id === selectedProvider.value),
);
const keyLink = computed(() => keyLinks[selectedProvider.value] || "");

// 新增表单数据（切换服务商即重置，不做草稿回填）
// 初始化与重置都使用服务商官方地址，无需用户重复复制。
const createFormSource = () => ({
  // 用户自定义别名
  name: "",
  // 请求的模型名称
  model: "",
  // 服务商访问密钥
  key: "",
  // 默认官方地址，可在高级设置中自定义
  url: currentProvider.value?.defaultUrl ?? currentProvider.value?.preset?.url ?? "",
  // 请求协议
  protocol: "chatCompletions" as const,
});
const formSource = ref(createFormSource());
const showAdvanced = ref(false);
const testing = ref(false);
const testPassed = ref(false);
// 必填配置完整且别名唯一时才允许添加，空别名仍可使用。
const canAdd = computed(() => {
  const src = formSource.value;
  const alias = src.name.trim();
  return (
    Boolean(src.model.trim() && src.key.trim() && src.url.trim()) &&
    (!alias || !aiStore.modelList.some((model) => model.name?.trim() === alias))
  );
});

// 选择服务商：重置表单与测试状态
function selectProvider(item: any) {
  if (selectedProvider.value === item.id) return;
  selectedProvider.value = item.id;
  formSource.value = createFormSource();
  showAdvanced.value = false;
  testPassed.value = false;
}

// 选中项因已添加而从列表移除时（雪花服务），自动切到第一个可选服务商
watch(
  () => providerList.value.map((item) => item.id).join(),
  () => {
    if (!providerList.value.some((item) => item.id === selectedProvider.value)) {
      selectProvider(providerList.value[0]);
    }
  },
  { immediate: true },
);

// 非空别名去除首尾空格后必须唯一，空别名仍允许使用模型名称展示。
function validateAlias(name: string) {
  const alias = name.trim();
  if (alias && aiStore.modelList.some((model) => model.name?.trim() === alias)) {
    ElMessage.error("别名已存在，请使用其他别名");
    return false;
  }
  return true;
}

// 点击「添加模型」：先测试连接，通过后部署到已添加列表
async function handleAdd() {
  const src = formSource.value;
  if (!selectedProvider.value || testing.value) return;
  if (!validateAlias(src.name)) return;
  if (!canAdd.value) return;
  if (!testPassed.value) {
    testing.value = true;
    try {
      const llm = new LLM({
        url: src.url,
        apiKey: src.key,
        provider: selectedProvider.value,
        model: src.model,
        protocol: src.protocol,
      });
      await llm.ping();
      testPassed.value = true;
    } catch (error: any) {
      ElMessage.error(error?.message || "添加模型失败");
      return;
    } finally {
      testing.value = false;
    }
  }
  // 测试期间可能修改别名或新增模型，保存前再次核验。
  if (!validateAlias(src.name)) return;
  aiStore.deployModel({ provider: selectedProvider.value, ...src, name: src.name.trim() });
  ElMessage.success("模型添加成功");
  testPassed.value = false;
  formSource.value = createFormSource();
  showAdvanced.value = false;
  // 添加成功后切到「已添加模型」Tab，让用户看到新模型
  emit("addSuccess");
}

// 添加内置服务（雪花服务）：配置已预置，无需表单测试，直接部署
function handleAddBuiltin() {
  const preset = currentProvider.value?.preset;
  if (!preset) return;
  if (!validateAlias(preset.name)) return;
  aiStore.deployModel({ ...preset, builtin: true });
  ElMessage.success("模型添加成功");
  // 添加成功后切到「已添加模型」Tab，让用户看到新模型
  emit("addSuccess");
}
provide("bg", "bg-sf-bg");
</script>

<template>
  <div class="flex h-full min-h-0 gap-3">
    <!-- 左侧：可添加服务商列表 -->
    <div class="flex w-44 shrink-0 flex-col gap-3">
      <div class="text-xs font-bold text-sf-text-2">服务商</div>
      <SfList
        :list="providerList"
        active-key="id"
        :active-value="selectedProvider"
        @onClick="selectProvider"
      >
        <template #default="{ item }">
          <div class="flex min-w-0 flex-1 items-center gap-1">
            <span class="truncate">{{ item.name }}</span>
            <el-tag v-if="item.builtin" type="info" size="small" class="shrink-0">内置</el-tag>
          </div>
        </template>
      </SfList>
    </div>

    <!-- 右侧：内置服务卡片 / 新增模型表单 -->
    <div class="flex h-full min-h-0 flex-1 flex-col gap-3">
      <!-- 内置服务卡片：配置已预置，直接添加 -->
      <div v-if="currentProvider?.preset" class="flex min-h-0 flex-1 flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="font-bold text-sf-text">{{ currentProvider?.name }}</span>
          <el-tag type="success">内置</el-tag>
        </div>
        <div class="text-sm text-sf-text-3">配置已内置，无需填写，添加后即可切换使用</div>
        <div class="mt-auto pt-3">
          <SfButton class="w-full" @click="handleAddBuiltin">添加模型</SfButton>
        </div>
      </div>

      <!-- 新增模型表单 -->
      <div v-else class="flex min-h-0 flex-1 flex-col gap-3">
        <!-- 可滚动字段区 -->
        <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          <span class="font-bold text-sf-text">{{ currentProvider?.name }}</span>

          <!-- 别名 -->
          <div>
            <label class="mb-1 block text-xs text-sf-text-2">别名（可选）</label>
            <SfInput v-model="formSource.name" class="w-full" placeholder="如：我的 GPT-4" />
          </div>

          <!-- 模型标识 -->
          <SfFormItem label="模型" prop="model">
            <SfInput v-model="formSource.model" class="w-full" placeholder="请输入模型名称" />
          </SfFormItem>

          <!-- API Key -->
          <div>
            <div class="mb-1 flex h-5 w-full items-center justify-between">
              <span class="pl-2 font-bold text-sf-text">API Key</span>
              <a
                :href="keyLink"
                target="_blank"
                rel="noopener"
                class="cursor-pointer text-sf-theme hover:underline"
                >获取key</a
              >
            </div>
            <SfFormItem prop="key">
              <SfInput
                v-model="formSource.key"
                type="password"
                show-password
                class="w-full"
                placeholder="请输入 API Key"
              />
            </SfFormItem>
          </div>

          <!-- 官方接口已自动填写，自定义地址仅在高级设置中展示。 -->
          <div class="rounded-2xl border border-sf-b p-3">
            <button
              type="button"
              class="flex w-full cursor-pointer items-center justify-between gap-3 text-left text-sm text-sf-text-2 transition-colors hover:text-sf-theme"
              :aria-expanded="showAdvanced"
              aria-controls="ai-add-model-advanced"
              @click="showAdvanced = !showAdvanced"
            >
              <span>高级设置</span>
              <SfIcon
                icon="mingcute:down-line"
                size="4"
                class="transition-transform"
                :class="{ 'rotate-180': showAdvanced }"
              />
            </button>
            <div v-if="showAdvanced" id="ai-add-model-advanced" class="mt-3 flex flex-col gap-3">
              <p class="text-xs text-sf-text-3">
                默认使用官方接口，仅在使用代理或自定义服务时修改。
              </p>
              <SfFormItem label="自定义接口地址（完整 URL）" prop="url">
                <SfInput v-model="formSource.url" :placeholder="currentProvider?.defaultUrl" />
              </SfFormItem>
            </div>
          </div>
        </div>

        <!-- 操作按钮：固定底部，始终可见 -->
        <div class="text-xs text-sf-text-3">连通性测试会发起一次真实请求，会消耗少量模型Token</div>
        <!-- 统一按钮组件，连接测试期间禁用并展示加载图标。 -->
        <SfButton
          class="w-full gap-3"
          :type="canAdd ? 'theme' : 'bg'"
          :disabled="testing || !canAdd"
          :aria-busy="testing"
          @click="handleAdd"
        >
          <SfIcon v-if="testing" icon="line-md:loading-twotone-loop" size="4" />
          {{ testing ? "测试中..." : "添加模型" }}
        </SfButton>
      </div>
    </div>
  </div>
</template>
