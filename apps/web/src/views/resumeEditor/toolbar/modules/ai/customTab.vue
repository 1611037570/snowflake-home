<script setup>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import { useAiStore } from "@/stores/modules/ai";
import { LLM } from "@/apis";

const props = defineProps({
  // 当前编辑的平台类型
  provider: {
    type: String,
    required: true,
  },
});

// 使用 ai store
const aiStore = useAiStore();
const { activeModel, customModels } = storeToRefs(aiStore);

// 当前编辑的配置项（实时同步数组）
const form = computed(() => customModels.value.find((item) => item.provider === props.provider));
const formRef = ref();
const testing = ref(false);
const connectionPassed = ref(false);

// 各平台获取 key 的链接
const keyLinks = {
  openai: "https://platform.openai.com/api-keys",
  ark: "https://console.volcengine.com/ark",
  deepseek: "https://platform.deepseek.com/",
};
// 当前平台的获取 key 链接
const keyLink = computed(() => keyLinks[props.provider] || "");

// 配置项不存在时自动创建默认项，保证表单可实时编辑
watch(
  () => props.provider,
  () => {
    if (!customModels.value.some((item) => item.provider === props.provider)) {
      customModels.value.push({
        provider: props.provider,
        model: "",
        key: "",
        url: "",
      });
    }
  },
  { immediate: true },
);

// 配置字段校验规则：限制空白字符并校验完整接口地址
const rules = {
  model: [
    {
      required: true,
      pattern: /^\S+$/,
      message: "请输入有效的模型名称",
      trigger: "blur",
    },
  ],
  key: [
    {
      required: true,
      pattern: /^\S+$/,
      message: "请输入有效的 API Key",
      trigger: "blur",
    },
  ],
  url: [
    {
      required: true,
      pattern: /^https?:\/\/[^\s]+$/,
      message: "请输入完整的 HTTP(S) 接口地址",
      trigger: "blur",
    },
  ],
};

// 是否为当前激活的服务
const isActive = computed(() => activeModel.value === props.provider);

// 使用当前配置发送最小请求，验证接口地址、密钥和模型是否可用
async function testConnection() {
  if (!form.value) return;
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  connectionPassed.value = false;
  testing.value = true;
  try {
    const llm = new LLM({
      baseUrl: form.value.url,
      getApiKey: () => form.value.key,
      provider: form.value.provider,
    });
    await llm.ping(form.value.model);
    connectionPassed.value = true;
    ElMessage.success("连接测试成功");
  } catch (error) {
    ElMessage.error(error?.message || "连接测试失败");
  } finally {
    testing.value = false;
  }
}

// 使用该配置
function useService() {
  activeModel.value = props.provider;
}
</script>

<template>
  <div v-if="form" class="flex flex-col gap-3">
    <el-form ref="formRef" :model="form" :rules="rules" class="flex flex-col gap-3">
      <!-- 模型 -->
      <SfFormItem label="模型" prop="model">
        <SfInput v-model="form.model" class="w-full" placeholder="请输入模型名称" />
      </SfFormItem>
      <div class="mb-1 flex h-5 w-full items-center justify-between">
        <span class="pr-1 pl-2 font-bold text-sf-text">API Key</span>
        <a
          :href="keyLink"
          target="_blank"
          rel="noopener"
          class="cursor-pointer text-xs text-sf-theme hover:underline"
        >
          获取key
        </a>
      </div>
      <SfFormItem prop="key">
        <SfInput
          v-model="form.key"
          type="password"
          show-password
          class="w-full"
          placeholder="请输入 API Key"
        />
      </SfFormItem>

      <!-- 接口地址 -->
      <SfFormItem label="接口地址 (完整URL)" prop="url">
        <SfInput v-model="form.url" placeholder="如：https://api.openai.com/v1/chat/completions" />
      </SfFormItem>
    </el-form>

    <!-- 提示：强制开启深度思考，推荐使用最新模型 -->
    <div class="flex items-center text-xs text-sf-text-3">
      <SfIcon icon="mdi:information-variant" size="3.5" class="mr-1" />
      项目会强制开启深度思考，推荐使用最新模型获取更智能的回复。
    </div>
    <div class="flex gap-3">
      <!-- 使用当前配置测试接口连通性 -->
      <el-button type="primary" class="flex-1" :loading="testing" @click="testConnection">
        测试连接
      </el-button>
      <!-- 使用该服务按钮 -->
      <el-button
        type="primary"
        class="flex-1"
        :disabled="isActive || !connectionPassed"
        @click="useService"
      >
        {{ isActive ? "已选择" : "使用该服务" }}
      </el-button>
    </div>
  </div>
  <div v-else class="text-sm text-sf-text-3">配置不存在</div>
</template>
