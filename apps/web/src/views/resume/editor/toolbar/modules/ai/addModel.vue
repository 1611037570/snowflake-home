<script setup lang="ts">
import { computed, provide, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { useAiStore } from "@/stores/modules/ai";
import { LLM } from "@/apis";
import { PROVIDER_NAMES, snowflake } from "@/configs";
import { getProviderIcon } from "./providerIcons";

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
  { id: "openai", name: PROVIDER_NAMES.openai, defaultUrl: "https://api.openai.com/v1/chat/completions" },
  // 豆包保留原先第三个预设的位置，新增服务商排在后面。
  {
    id: "ark",
    name: PROVIDER_NAMES.ark,
    defaultUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
  },
  {
    id: "gemini", // Gemini 使用官方 OpenAI 兼容入口。
    name: PROVIDER_NAMES.gemini, // 服务商展示名称。
    defaultUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", // 完整聊天请求地址。
  },
  { id: "deepseek", name: PROVIDER_NAMES.deepseek, defaultUrl: "https://api.deepseek.com/chat/completions" },
  {
    id: "claude", // Claude 使用官方 OpenAI 兼容入口。
    name: PROVIDER_NAMES.claude, // 服务商展示名称。
    defaultUrl: "https://api.anthropic.com/v1/chat/completions", // 完整聊天请求地址。
  },
  {
    id: "qwen", // 千问通过阿里云百炼接入。
    name: PROVIDER_NAMES.qwen, // 服务商展示名称。
    defaultUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", // 默认北京地域的完整请求地址。
  },
];
// 各服务商获取 Key 的链接
const keyLinks: Record<string, string> = {
  openai: "https://platform.openai.com/api-keys",
  ark: "https://console.volcengine.com/ark",
  deepseek: "https://platform.deepseek.com/",
  gemini: "https://aistudio.google.com/apikey", // Gemini 官方密钥管理页。
  claude: "https://platform.claude.com/settings/keys", // Claude 官方密钥管理页。
  qwen: "https://bailian.console.aliyun.com/", // 阿里云百炼控制台。
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
  // 添加成功后返回模型库，让用户继续为角色分配模型。
  emit("addSuccess");
}

// 添加内置服务（雪花服务）：配置已预置，无需表单测试，直接部署
function handleAddBuiltin() {
  const preset = currentProvider.value?.preset;
  if (!preset) return;
  if (!validateAlias(preset.name)) return;
  aiStore.deployModel({ ...preset, builtin: true });
  ElMessage.success("模型添加成功");
  // 内置服务沿用同一条添加完成动线。
  emit("addSuccess");
}
provide("bg", "bg-sf-bg");
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-3">
    <!-- 服务商改为顶部选择，填写配置时不再横跨侧栏与表单。 -->
    <div class="flex shrink-0 flex-wrap gap-[6px]" aria-label="选择服务商">
      <button
        v-for="item in providerList"
        :key="item.id"
        type="button"
        class="inline-flex cursor-pointer items-center gap-[6px] rounded-xl border px-3 py-[6px] text-xs font-medium transition-colors disabled:cursor-wait disabled:opacity-60"
        :class="item.id === selectedProvider ? 'border-sf-theme bg-sf-theme-3 text-sf-theme' : 'border-sf-b text-sf-text-2 hover:border-sf-theme hover:bg-sf-bg'"
        :aria-pressed="item.id === selectedProvider"
        :disabled="testing"
        @click="selectProvider(item)"
      >
        <SfIcon :icon="getProviderIcon(item.id, item.builtin)" size="5" class="shrink-0" />
        {{ item.name }}
        <span v-if="item.builtin" class="text-[10px]">内置</span>
        <SfIcon v-if="item.id === selectedProvider" icon="lucide:check" size="3" />
      </button>
    </div>

    <!-- 配置区域独立滚动，底部主操作在填写过程中始终可见。 -->
    <SfScrollbar flush class="min-h-0 flex-1">
      <div v-if="currentProvider?.preset" class="rounded-xl border border-sf-b bg-sf-bg p-6">
        <span class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sf-theme-3 text-sf-theme">
          <SfIcon icon="ph:snowflake-duotone" size="6" />
        </span>
        <h3 class="text-base font-semibold text-sf-text">{{ currentProvider.name }}</h3>
        <p class="mt-3 text-sm leading-6 text-sf-text-2">配置已准备好，无需填写 API Key 或接口地址，直接添加即可。</p>
        <p class="mt-3 text-xs leading-5 text-sf-text-3">添加后，可在上方为小舟、简历解析和小羊选择使用的模型。</p>
      </div>
      <div v-else class="flex flex-col gap-3">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label class="flex flex-col gap-[6px] text-xs font-medium text-sf-text-2">
            模型名称
            <SfInput v-model="formSource.model" class="w-full" placeholder="填写服务商提供的模型名称" :disabled="testing" />
          </label>
          <label class="flex flex-col gap-[6px] text-xs font-medium text-sf-text-2">
            别名（可选）
            <SfInput v-model="formSource.name" class="w-full" placeholder="方便自己识别的名称" :disabled="testing" />
          </label>
        </div>
        <div class="flex flex-col gap-[6px]">
          <div class="flex items-center justify-between gap-3 text-xs font-medium text-sf-text-2">
            <span>API Key</span>
            <a v-if="keyLink" :href="keyLink" target="_blank" rel="noopener noreferrer" class="text-sf-theme hover:underline">获取 API Key</a>
          </div>
          <SfInput v-model="formSource.key" type="password" show-password class="w-full" placeholder="粘贴 API Key" aria-label="API Key" :disabled="testing" />
        </div>
        <!-- 官方地址保持默认，高级选项继续按需展开。 -->
        <div class="rounded-xl border border-sf-b p-3">
          <button
            type="button"
            class="flex w-full cursor-pointer items-center justify-between gap-3 text-left text-xs font-medium text-sf-text-2 transition-colors hover:text-sf-theme"
            :aria-expanded="showAdvanced"
            aria-controls="ai-add-model-advanced"
            @click="showAdvanced = !showAdvanced"
          >
            <span>高级设置 · 接口地址</span>
            <SfIcon icon="mingcute:down-line" size="4" :class="{ 'rotate-180': showAdvanced }" />
          </button>
          <div v-if="showAdvanced" id="ai-add-model-advanced" class="mt-3 flex flex-col gap-3">
            <p class="text-xs leading-5 text-sf-text-3">默认使用官方接口，仅在使用代理或自定义服务时修改。</p>
            <label class="flex flex-col gap-[6px] text-xs text-sf-text-2">
              完整接口地址
              <SfInput v-model="formSource.url" :placeholder="currentProvider?.defaultUrl" :disabled="testing" />
            </label>
          </div>
        </div>
      </div>
    </SfScrollbar>

    <footer class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-sf-b pt-3">
      <p class="min-w-0 flex-1 text-xs leading-5 text-sf-text-3">
        {{ currentProvider?.preset ? "添加后返回模型库，再为角色选择模型。" : "添加前会测试连接，可能消耗少量 Token。" }}
      </p>
      <SfButton
        v-if="currentProvider?.preset"
        class="shrink-0"
        @click="handleAddBuiltin"
      >添加模型</SfButton>
      <SfButton
        v-else
        class="shrink-0 gap-[6px]"
        :type="canAdd ? 'theme' : 'bg'"
        :disabled="testing || !canAdd"
        :aria-busy="testing"
        @click="handleAdd"
      >
        <SfIcon v-if="testing" icon="line-md:loading-twotone-loop" size="4" />
        {{ testing ? "正在测试连接" : "测试并添加" }}
      </SfButton>
    </footer>
  </div>
</template>
