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
  id: string;
  name: string;
  builtin?: boolean;
  preset?: {
    provider: string;
    name: string;
    model: string;
    key: string;
    url: string;
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
    },
  },
  { id: "openai", name: "OpenAI" },
  { id: "ark", name: "火山方舟 Ark" },
  { id: "deepseek", name: "DeepSeek" },
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
const formSource = ref({ name: "", model: "", key: "", url: "" });
const testing = ref(false);
const testPassed = ref(false);

// 选择服务商：重置表单与测试状态
function selectProvider(item: any) {
  if (selectedProvider.value === item.id) return;
  selectedProvider.value = item.id;
  formSource.value = { name: "", model: "", key: "", url: "" };
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

// 点击「添加模型」：先测试连接，通过后部署到已添加列表
async function handleAdd() {
  const src = formSource.value;
  if (!selectedProvider.value || testing.value) return;
  if (!testPassed.value) {
    testing.value = true;
    try {
      const llm = new LLM({
        url: src.url,
        apiKey: src.key,
        provider: selectedProvider.value,
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
  aiStore.deployModel({ provider: selectedProvider.value, ...src });
  ElMessage.success("模型添加成功");
  testPassed.value = false;
  formSource.value = { name: "", model: "", key: "", url: "" };
  // 添加成功后切到「已添加模型」Tab，让用户看到新模型
  emit("addSuccess");
}

// 添加内置服务（雪花服务）：配置已预置，无需表单测试，直接部署
function handleAddBuiltin() {
  const preset = currentProvider.value?.preset;
  if (!preset) return;
  aiStore.deployModel({ ...preset });
  ElMessage.success("模型添加成功");
  // 添加成功后切到「已添加模型」Tab，让用户看到新模型
  emit("addSuccess");
}
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
    <div class="flex h-full min-h-0 flex-1 flex-col gap-3 p-3">
      <!-- 内置服务卡片：配置已预置，直接添加 -->
      <div v-if="currentProvider?.preset" class="flex min-h-0 flex-1 flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="font-bold text-sf-text">{{ currentProvider?.name }}</span>
          <el-tag type="success">内置</el-tag>
        </div>
        <div class="text-sm text-sf-text-3">配置已内置，无需填写，添加后即可切换使用</div>
        <div class="mt-auto pt-3">
          <el-button type="primary" class="w-full" @click="handleAddBuiltin">添加模型</el-button>
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

          <!-- 接口地址 -->
          <SfFormItem label="接口地址 (完整URL)" prop="url">
            <SfInput
              v-model="formSource.url"
              placeholder="如：https://api.openai.com/v1/chat/completions"
            />
          </SfFormItem>

          <!-- 提示 -->
          <div class="flex items-center text-xs text-sf-text-3">
            <SfIcon icon="mdi:information-variant" size="3.5" class="mr-1" />
            项目会强制开启深度思考，推荐使用最新模型获取更智能的回复。
          </div>
        </div>

        <!-- 操作按钮：固定底部，始终可见 -->
        <el-button type="primary" class="w-full" :loading="testing" @click="handleAdd">
          {{ testing ? "测试中..." : "添加模型" }}
        </el-button>
      </div>
    </div>
  </div>
</template>
