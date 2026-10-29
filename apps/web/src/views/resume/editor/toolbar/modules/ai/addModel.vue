<script setup lang="ts">
import { computed, onBeforeUnmount, provide, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { useAiStore, type ModelItem, type ProviderCredential } from "@/stores/modules/ai";
import confirm from "@/components/business/confirm";
import { LLM } from "@/apis";
import { PROVIDER_NAMES, snowflake } from "@/configs";
import { getProviderIcon } from "./providerIcons";
import { MODEL_PRESETS, type ModelPreset } from "./modelPresets";

const props = defineProps<{
  /** 已添加模型当前绑定的角色名称。 */
  bindings: Record<string, string[]>;
}>();

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

// 单一服务商界面只保留配置草稿，自定义模型通过弹窗添加。
interface ProviderForm extends ProviderCredential {
  /** 自定义模型的可选别名。 */
  name: string;
  /** 自定义模型标识或推理接入点。 */
  model: string;
}
interface ConnectionState {
  /** 连接检测所处阶段。 */
  status: "testing" | "success" | "error";
  /** 检测结果或真实错误原因。 */
  message: string;
}
interface ProviderSession {
  /** 尚未提交的配置和自定义模型草稿。 */
  form: ProviderForm;
  /** 按模型名称或别名筛选的关键词。 */
  search: string;
  /** 是否展开接口地址设置。 */
  advanced: boolean;
  /** 各模型在本次设置会话中的检测结果。 */
  connections: Record<string, ConnectionState>;
}
interface ModelCard {
  /** 已添加模型的稳定编号。 */
  key: string;
  /** 请求使用的模型标识。 */
  model: string;
  /** 展示名称，已有别名时优先使用别名。 */
  name: string;
  /** 已添加模型的完整配置。 */
  saved: ModelItem;
}

// 官方服务商优先展示，内置服务保留在列表末尾。
const providerList = [...providerTemplates.filter((item) => !item.builtin), ...providerTemplates.filter((item) => item.builtin)];

function getProviderModels(provider: ProviderTemplate) {
  return aiStore.modelList.filter((model) => provider.builtin
    ? model.builtin
    : !model.builtin && model.provider === provider.id);
}

// 兼容旧配置：已添加模型中的密钥可继续使用，无需重新录入。
function getCredential(provider: ProviderTemplate): ProviderCredential | undefined {
  if (provider.builtin) return;
  const credential = aiStore.providerCredentials[provider.id];
  if (credential) return credential;
  const saved = getProviderModels(provider).at(-1);
  if (!saved?.key.trim()) return;
  return {
    key: saved.key, // 旧模型已保存的访问密钥。
    url: saved.url, // 旧模型实际使用的接口地址。
    protocol: saved.protocol === "responses" ? "responses" : "chatCompletions", // 保留旧模型请求协议。
  };
}

const selectedProvider = ref(providerList.find((provider) => getCredential(provider))?.id || "openai");
const currentProvider = computed(() => providerList.find((provider) => provider.id === selectedProvider.value)!);
const keyLink = computed(() => keyLinks[selectedProvider.value] || "");
const sessions = reactive<Record<string, ProviderSession>>({});
const testingModel = ref("");
const customVisible = ref(false);
const busy = computed(() => Boolean(testingModel.value));
let disposed = false;

function createSession(provider: ProviderTemplate): ProviderSession {
  const credential = getCredential(provider);
  // 将旧模型中已有的密钥迁入独立配置，删除最后一个模型时仍保留服务商密钥。
  if (credential?.key.trim() && !aiStore.providerCredentials[provider.id]) {
    aiStore.saveProviderCredential(provider.id, credential);
  }
  return {
    form: {
      key: credential?.key || "", // 仅回填已保存的密钥。
      url: credential?.url || provider.defaultUrl || provider.preset?.url || "", // 默认沿用服务商地址。
      protocol: credential?.protocol || "chatCompletions", // 沿用已保存的请求协议。
      model: "", // 自定义模型初始留空。
      name: "", // 可选别名初始留空。
    },
    search: "", // 初始展示全部模型。
    advanced: false, // 接口地址按需展开。
    connections: {}, // 检测结果仅在本次会话中保留。
  };
}
sessions[selectedProvider.value] = createSession(currentProvider.value);
const session = computed(() => sessions[selectedProvider.value]!);
const form = computed(() => session.value.form);
// 预设只在添加时辅助填写，添加后的模型由用户自行维护。
const modelPresets = computed(() => MODEL_PRESETS.filter((preset) => preset.provider === selectedProvider.value));

function selectModelPreset(preset: ModelPreset) {
  form.value.model = preset.model;
  // 选择预设时仅补充空别名，保留用户填写的名称。
  if (!form.value.name.trim()) form.value.name = preset.name;
}
const savedCredential = computed(() => getCredential(currentProvider.value));
// 输入自动持久化，密钥非空且接口地址有效时即可添加模型。
const credentialReady = computed(() => Boolean(savedCredential.value?.key.trim()) &&
  savedCredential.value?.key.trim() === form.value.key.trim() &&
  savedCredential.value?.url.trim() === form.value.url.trim() &&
  savedCredential.value?.protocol === form.value.protocol);

function selectProvider(provider: ProviderTemplate) {
  if (busy.value || provider.id === selectedProvider.value) return;
  customVisible.value = false;
  sessions[provider.id] ??= createSession(provider);
  selectedProvider.value = provider.id;
}

// 输入合法时自动保存，包括清空密钥；不覆盖已有模型的独立凭据。
function persistCredential() {
  try {
    const url = new URL(form.value.url.trim());
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
  } catch {
    // 地址输入未完成时保留草稿，不弹提示或发起请求。
    return;
  }
  aiStore.saveProviderCredential(selectedProvider.value, {
    key: form.value.key, // 随输入自动保存的服务商密钥。
    url: form.value.url, // 与密钥配套的请求地址。
    protocol: form.value.protocol, // 新模型使用的请求协议。
  });
}

// 仅展示当前服务商下已添加的模型。
const modelCards = computed<ModelCard[]>(() => {
  const saved = getProviderModels(currentProvider.value);
  const cards: ModelCard[] = saved.map((model) => ({
    key: model.id, // 保留每份已有配置的独立身份。
    model: model.model, // 真实请求的模型标识。
    name: model.name || model.model, // 别名优先用于展示。
    saved: model, // 检测与删除都使用该条目自己的配置。
  }));
  const keyword = session.value.search.trim().toLowerCase();
  return cards.filter((card) => `${card.name} ${card.model}`.toLowerCase().includes(keyword));
});

// 新请求只从已保存的凭据构造，修改中的草稿不会被直接用于请求。
function createModelConfig(model: string, name = "") {
  const credential = savedCredential.value;
  return {
    provider: selectedProvider.value, // 本次请求的服务商标识。
    model: model.trim(), // 当前模型标识。
    name: name.trim(), // 可选的自定义展示名称。
    key: credential?.key.trim() || "", // 只使用用户已经保存的密钥。
    url: credential?.url.trim() || "", // 只使用与密钥一起保存的地址。
    protocol: credential?.protocol || "chatCompletions", // 当前服务商保存的协议。
  };
}

// 配置输入变化时清除检测结果并自动保存，切换服务商不覆盖各自草稿。
watch(
  () => [selectedProvider.value, form.value.key, form.value.url, form.value.protocol],
  (current, previous) => {
    if (current[0] !== previous[0]) return;
    session.value.connections = {};
    persistCredential();
  },
  { flush: "sync" },
);

function openCustomModel() {
  if (busy.value) return;
  if (!credentialReady.value) {
    ElMessage.warning("请先填写 API 密钥并检查接口地址");
    return;
  }
  customVisible.value = true;
}

// 已有模型使用自身保存的配置检测，新模型则先检测再写入。
async function testModel(model: string, add = false, alias = "", saved?: ModelItem) {
  if (busy.value || !model.trim()) return;
  if (!saved && !credentialReady.value) {
    ElMessage.warning("请先填写 API 密钥并检查接口地址");
    return;
  }
  const target = session.value;
  const config = saved || createModelConfig(model, alias);
  const cardKey = saved?.id || `draft:${config.model}`;
  const duplicate = () => aiStore.modelList.some((item) =>
    item.provider === config.provider && item.model === config.model &&
    item.key.trim() === config.key.trim() && item.url.trim() === config.url.trim() &&
    item.protocol === config.protocol);
  if (add && duplicate()) {
    ElMessage.info("该模型已添加");
    return;
  }
  if (add && config.name && aiStore.modelList.some((item) => item.name?.trim() === config.name?.trim())) {
    ElMessage.error("别名已存在，请使用其他别名");
    return;
  }
  testingModel.value = cardKey;
  try {
    if (!add || target.connections[cardKey]?.status !== "success") {
      target.connections[cardKey] = {
        status: "testing", // 当前模型正在检测。
        message: "正在检测连接…", // 明确请求仍在进行。
      };
      const llm = new LLM({
        url: config.url, // 冻结本次检测的完整地址。
        apiKey: config.key, // 使用对应模型或服务商已保存的密钥。
        provider: config.provider, // 当前模型的真实服务商。
        model: config.model, // 本次检测的模型标识。
        protocol: config.protocol, // 当前模型请求协议。
      });
      await llm.ping();
      if (disposed) return;
      if (saved && !aiStore.modelList.some((item) => item.id === saved.id)) return;
      target.connections[cardKey] = {
        status: "success", // 当前模型通过最小请求检测。
        message: "连接成功", // 允许新模型继续保存。
      };
    }
    if (disposed || !add || duplicate()) return;
    if (config.name && aiStore.modelList.some((item) => item.name?.trim() === config.name?.trim())) {
      ElMessage.error("别名已存在，请使用其他别名");
      return;
    }
    const deployed = aiStore.deployModel(config);
    target.connections[deployed.id] = target.connections[cardKey]!;
    target.form.model = "";
    target.form.name = "";
    customVisible.value = false;
    ElMessage.success("模型添加成功，可在上方分配给角色");
  } catch (error: unknown) {
    if (disposed) return;
    target.connections[cardKey] = {
      status: "error", // 失败只影响当前模型。
      message: error instanceof Error ? error.message : "连接失败，请检查模型配置", // 保留服务商的真实错误原因。
    };
  } finally {
    testingModel.value = "";
  }
}

function handleAddBuiltin() {
  const preset = currentProvider.value.preset;
  if (!preset || getProviderModels(currentProvider.value).length) return;
  if (aiStore.modelList.some((model) => model.name?.trim() === preset.name)) {
    ElMessage.error("别名已存在，请使用其他别名");
    return;
  }
  aiStore.deployModel({ ...preset, builtin: true });
  ElMessage.success("模型添加成功，可在上方分配给角色");
}

// 删除操作仍使用原有确认机制，并由模型仓库同步解绑角色。
function removeModel(model: ModelItem) {
  confirm("确定要删除该模型吗？此操作不可恢复。", "删除模型", {
    confirmText: "删除", // 明确本次删除操作。
    cancelText: "取消", // 保留模型和当前角色绑定。
  }).then(() => aiStore.deleteModel(model.id)).catch(() => {});
}

onBeforeUnmount(() => {
  disposed = true;
});
provide("bg", "bg-sf-bg");
</script>

<template>
  <!-- 侧栏按内容留足宽度，与主区域共用底色，只有选中项显示背景反馈。 -->
  <div class="grid min-w-0 grid-cols-1 overflow-hidden rounded-2xl border border-sf-b bg-sf-primary md:grid-cols-[minmax(240px,max-content)_minmax(0,1fr)]">
    <nav class="flex gap-[6px] overflow-x-auto border-b border-sf-b p-3 md:flex-col md:overflow-visible md:border-r md:border-b-0" aria-label="选择服务商">
      <button v-for="provider in providerList" :key="provider.id" type="button" class="flex min-w-0 shrink-0 cursor-pointer items-center gap-3 rounded-xl border p-3 text-left md:w-full transition-colors disabled:cursor-wait disabled:opacity-60" :class="selectedProvider === provider.id ? 'border-sf-b bg-sf-bg text-sf-text' : 'border-transparent text-sf-text-2 hover:bg-sf-bg'" :aria-pressed="selectedProvider === provider.id" :disabled="busy" @click="selectProvider(provider)">
        <SfIcon :icon="getProviderIcon(provider.id, provider.builtin)" size="6" box-size="9" class="shrink-0" />
        <span class="min-w-0 flex-1">
          <span class="block text-sm leading-6 font-medium [overflow-wrap:anywhere]">{{ provider.name }}</span>
          <span class="mt-[3px] flex items-center gap-[6px] whitespace-nowrap text-xs" :class="getCredential(provider)?.key.trim() || (provider.builtin && getProviderModels(provider).length) ? 'text-sf-success' : 'text-sf-text-3'">
            <span class="h-[6px] w-[6px] rounded-full bg-current" />
            {{ getCredential(provider)?.key.trim() || (provider.builtin && getProviderModels(provider).length) ? '已配置' : provider.builtin ? '内置服务' : '待完善配置' }}
          </span>
        </span>
      </button>
    </nav>

    <section class="flex min-w-0 flex-col gap-3 p-3">
      <header class="flex flex-wrap items-center justify-between gap-3 border-b border-sf-b pb-3">
        <div class="flex min-w-0 items-center gap-3">
          <SfIcon :icon="getProviderIcon(currentProvider.id, currentProvider.builtin)" size="6" box-size="12" class="shrink-0 rounded-xl border border-sf-b bg-sf-bg" />
          <h3 class="text-lg font-semibold text-sf-text">{{ currentProvider.name }}</h3>
        </div>
        <a v-if="keyLink" :href="keyLink" target="_blank" rel="noopener noreferrer" class="inline-flex h-9 items-center rounded-lg border border-sf-b px-3 text-xs text-sf-text-2 transition-colors hover:bg-sf-bg hover:text-sf-text">获取密钥 ↗</a>
      </header>

      <template v-if="!currentProvider.builtin">
        <!-- 密钥与接口地址随输入自动保存，不增加额外确认操作。 -->
        <div class="flex flex-col gap-[6px]">
          <label :for="`provider-key-${selectedProvider}`" class="text-sm font-medium text-sf-text">API 密钥</label>
          <SfInput :id="`provider-key-${selectedProvider}`" v-model="form.key" type="password" show-password class="h-9 w-full rounded-lg! border border-sf-b" placeholder="填入该服务商的 API Key" :disabled="busy" />
        </div>
        <section class="rounded-xl border border-sf-b p-3">
          <button type="button" class="flex w-full cursor-pointer items-center justify-between gap-3 text-left text-xs text-sf-text-2 hover:text-sf-text" :aria-expanded="session.advanced" @click="session.advanced = !session.advanced">
            <span>接口地址</span>
            <SfIcon icon="mingcute:down-line" size="4" box-size="6" :class="{ 'rotate-180': session.advanced }" />
          </button>
          <div v-if="session.advanced" class="mt-3 flex flex-col gap-[6px]">
            <SfInput v-model="form.url" class="h-9 w-full rounded-lg! border border-sf-b" :placeholder="currentProvider.defaultUrl" aria-label="完整接口地址" :disabled="busy" />
          </div>
        </section>
      </template>
      <p v-else class="text-xs leading-6 text-sf-text-2">内置配置无需填写密钥，添加后即可在上方为角色选择模型。</p>

      <header class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-[6px]">
          <h4 class="text-sm font-semibold text-sf-text">可用模型</h4>
          <span class="rounded-full bg-sf-bg px-3 py-[3px] text-xs text-sf-text-3 tabular-nums">{{ currentProvider.builtin && !modelCards.length ? 1 : modelCards.length }} 个模型</span>
        </div>
        <div v-if="!currentProvider.builtin" class="flex flex-wrap gap-3">
          <SfButton :round="false" type="bg" border :disabled="busy || !credentialReady" @click="openCustomModel">添加模型</SfButton>
        </div>
      </header>
      <SfInput v-if="getProviderModels(currentProvider).length > 1" v-model="session.search" class="h-9 w-full rounded-lg! border border-sf-b" placeholder="搜索模型名称" aria-label="搜索模型名称" />

      <div v-if="modelCards.length" class="grid gap-3 lg:grid-cols-2">
        <article v-for="card in modelCards" :key="card.key" class="flex min-w-0 flex-col gap-3 rounded-xl border border-sf-b p-3 transition-colors hover:border-sf-theme">
          <header class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h5 class="break-all text-sm leading-6 font-semibold text-sf-text">{{ card.name }}</h5>
              <p v-if="card.name !== card.model" class="mt-[6px] break-all text-xs text-sf-text-3">{{ card.model }}</p>
            </div>
            <span class="shrink-0 rounded bg-sf-success-2 px-[6px] py-[3px] text-[11px] text-sf-success">已添加</span>
          </header>
          <div v-if="props.bindings[card.saved.id]?.length" class="flex flex-wrap gap-[6px]">
            <span v-for="role in props.bindings[card.saved.id]" :key="role" class="rounded bg-sf-theme-3 px-[6px] py-[3px] text-[11px] text-sf-theme">{{ role }}</span>
          </div>
          <p v-if="session.connections[card.key]" role="status" class="break-words text-xs leading-6" :class="session.connections[card.key].status === 'success' ? 'text-sf-success' : session.connections[card.key].status === 'error' ? 'text-sf-error' : 'text-sf-text-2'">{{ session.connections[card.key].message }}</p>
          <footer class="mt-auto flex flex-wrap items-center gap-3 border-t border-sf-b pt-3">
            <SfButton :round="false" type="bg" border :disabled="busy" :aria-busy="testingModel === card.key" @click="testModel(card.model, false, '', card.saved)">{{ testingModel === card.key ? '检测中…' : '检测连接' }}</SfButton>
            <button type="button" class="ml-auto cursor-pointer rounded px-[6px] py-[3px] text-xs text-sf-text-3 transition-colors hover:bg-sf-error-2 hover:text-sf-error" :disabled="busy" @click="removeModel(card.saved)">删除</button>
          </footer>
        </article>
      </div>
      <article v-else-if="currentProvider.preset" class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sf-b p-3">
        <div class="min-w-0">
          <h5 class="text-sm font-semibold text-sf-text">{{ currentProvider.name }}</h5>
          <p class="mt-[6px] break-all text-xs text-sf-text-3">{{ currentProvider.preset.model }}</p>
        </div>
        <SfButton :round="false" @click="handleAddBuiltin">添加模型</SfButton>
      </article>
      <p v-else class="rounded-lg bg-sf-bg p-3 text-xs leading-6 text-sf-text-2">{{ !credentialReady ? '请先填写 API 密钥并检查接口地址。' : session.search ? '没有匹配的模型，请更换关键词。' : '暂无模型，点击“添加模型”填写模型信息。' }}</p>
    </section>
  </div>

  <!-- 模型标识用于接口调用，展示别名单独填写；接入点提示仅对豆包展示。 -->
  <SfModal v-model="customVisible" :title="`${currentProvider.name} · 添加模型`" width="480px" :before-close="() => !busy">
    <div class="flex flex-col gap-3">
      <!-- 预设仅填写模型 ID，实际可用性仍由连接检测确定。 -->
      <section v-if="modelPresets.length" class="flex flex-col gap-3">
        <span class="text-xs text-sf-text-2">常用模型</span>
        <div class="flex flex-wrap gap-3">
          <button v-for="preset in modelPresets" :key="preset.model" type="button" class="cursor-pointer rounded-lg border px-3 py-[6px] text-xs transition-colors disabled:cursor-wait disabled:opacity-60" :class="form.model.trim() === preset.model ? 'border-sf-theme bg-sf-bg text-sf-theme' : 'border-sf-b text-sf-text-2 hover:bg-sf-bg'" :aria-pressed="form.model.trim() === preset.model" :disabled="busy" @click="selectModelPreset(preset)">{{ preset.name }}</button>
        </div>
      </section>
      <label class="flex flex-col gap-[6px] text-xs text-sf-text-2">模型 ID（接口调用名）<SfInput v-model="form.model" class="h-9 w-full rounded-lg! border border-sf-b" :placeholder="selectedProvider === 'ark' ? '填写豆包控制台提供的模型 ID 或接入点 ID' : '填写服务商提供的模型 ID'" :disabled="busy" /></label>
      <label class="flex flex-col gap-[6px] text-xs text-sf-text-2">别名（可选）<SfInput v-model="form.name" class="h-9 w-full rounded-lg! border border-sf-b" placeholder="填写在模型列表中显示的名称" :disabled="busy" /></label>
      <p v-if="session.connections[`draft:${form.model.trim()}`]" role="status" class="text-xs leading-6 break-words" :class="session.connections[`draft:${form.model.trim()}`].status === 'error' ? 'text-sf-error' : 'text-sf-text-2'">{{ session.connections[`draft:${form.model.trim()}`].message }}</p>
      <p class="text-xs leading-6 text-sf-text-3">使用已保存的密钥检测并添加，测试请求可能消耗少量令牌。</p>
      <footer class="flex justify-end gap-3 border-t border-sf-b pt-3">
        <SfButton :round="false" type="bg" border :disabled="busy" @click="customVisible = false">取消</SfButton>
        <SfButton :round="false" :disabled="busy || !credentialReady || !form.model.trim()" @click="testModel(form.model, true, form.name)">{{ busy ? '正在检测…' : '检测并添加' }}</SfButton>
      </footer>
    </div>
  </SfModal>
</template>
