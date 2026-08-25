<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import { useAiStore } from "@/stores/modules/ai";
import { LLM } from "@/apis";

const props = defineProps({
  // 抽屉是否打开（用于初始化表单）
  visible: {
    type: Boolean,
    default: false,
  },
});

// 平台选项
const platformOptions = [
  { label: "火山方舟 (Ark)", value: "ark" },
  { label: "OpenAI", value: "openai" },
];

// 使用 ai store
const aiStore = useAiStore();
const { activeModel, customModel } = storeToRefs(aiStore);

// 自定义表单
const form = reactive({
  url: "",
  provider: "ark",
  model: "",
  key: "",
});
const formRef = ref();
const testing = ref(false);
const connectionPassed = ref(false);

// 兼容旧版本持久化的 { value: 配置 } 数据结构
const normalizeCustomModel = (model) => {
  const data = model?.value && typeof model.value === "object" ? model.value : model;
  return {
    url: data?.url || "",
    provider: data?.provider || "ark",
    model: data?.model || "",
    key: data?.key || "",
  };
};

// 配置字段校验规则：限制空白字符并校验完整接口地址
const rules = {
  provider: [
    {
      required: true,
      pattern: /^(ark|openai)$/,
      message: "请选择平台",
      trigger: "change",
    },
  ],
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

onMounted(() => {
  const model = normalizeCustomModel(customModel.value);
  Object.assign(form, model);
  // 立即覆盖旧的嵌套结构，后续只保留一层配置对象
  customModel.value = { ...model };
});

// 是否为当前激活的服务
const isActive = () => activeModel.value === "custom";

// 使用该服务：校验表单后保存配置，再切换激活状态
async function useService() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  customModel.value = { ...form };
  aiStore.activeModel = "custom";
}

// 使用当前配置发送最小请求，验证接口地址、密钥和模型是否可用
async function testConnection() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  connectionPassed.value = false;
  testing.value = true;
  try {
    const llm = new LLM({
      baseUrl: form.url,
      getToken: () => form.key,
      provider: form.provider,
    });
    await llm.ping(form.model);
    connectionPassed.value = true;
    ElMessage.success("连接测试成功");
    useService();
  } catch (error) {
    ElMessage.error(error?.message || "连接测试失败");
  } finally {
    testing.value = false;
  }
}
</script>

<template>
  <el-form ref="formRef" :model="form" :rules="rules" class="mt-3 flex flex-col gap-3">
    <!-- 平台 -->
    <SfFormItem label="平台" prop="provider">
      <el-select v-model="form.provider" class="w-full" placeholder="请选择平台">
        <el-option
          v-for="item in platformOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </SfFormItem>

    <!-- 模型 -->
    <SfFormItem label="模型" prop="model">
      <SfInput v-model="form.model" class="w-full" placeholder="请输入模型名称" />
    </SfFormItem>
    <SfFormItem label="API Key" prop="key">
      <SfInput v-model="form.key" type="password" show-password placeholder="请输入 API Key" />
    </SfFormItem>

    <!-- 接口地址 -->
    <SfFormItem label="接口地址 (完整URL)" prop="url">
      <SfInput v-model="form.url" placeholder="如：https://api.openai.com/v1/chat/completions" />
    </SfFormItem>

    <div class="flex gap-3">
      <!-- 使用当前配置测试接口连通性 -->
      <el-button type="primary" class="flex-1" :loading="testing" @click="testConnection">
        测试连接
      </el-button>
      <!-- 使用该服务按钮 -->
      <el-button type="primary" class="flex-1" :disabled="isActive() || !connectionPassed">
        {{ isActive() ? "已选择" : "使用该服务" }}
      </el-button>
    </div>
  </el-form>
</template>
