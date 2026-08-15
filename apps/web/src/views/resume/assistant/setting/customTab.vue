<script setup>
import { reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAiStore } from "@/stores/modules/ai";
import { useLocalStorage } from "@vueuse/core";

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

// 模型选项（按平台）
const modelOptionsMap = {
  ark: [
    { label: "Doubao-pro-32k", value: "doubao-pro-32k" },
    { label: "Doubao-lite-32k", value: "doubao-lite-32k" },
  ],
  openai: [
    { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
    { label: "GPT-4", value: "gpt-4" },
  ],
  custom: [{ label: "自定义模型", value: "custom-model" }],
};

// 使用 ai store
const aiStore = useAiStore();
const { activeService, customModel, customModelApi } = storeToRefs(aiStore);

// 本地存储：自定义表单其余字段（platform、token、baseUrl、path）
const customStorage = useLocalStorage("sf-resume-assistant-custom", {
  baseUrl: "",
  path: "",
  provider: "ark",
  token: "",
});

// 自定义表单
const form = reactive({
  baseUrl: "",
  path: "",
  provider: "ark",
  token: "",
  model: "",
  api: "",
});

// 抽屉打开时初始化表单（从 storage + ai store 取值）
watch(
  () => props.visible,
  (val) => {
    if (val) {
      form.baseUrl = customStorage.value.baseUrl;
      form.path = customStorage.value.path;
      form.provider = customStorage.value.provider || "ark";
      form.token = customStorage.value.token;
      form.model = customModel.value || (modelOptionsMap[form.provider]?.[0]?.value ?? "");
      form.api = customModelApi.value;
    }
  },
  { immediate: true },
);

// 是否为当前激活的服务
const isActive = () => activeService.value === "custom";

// 使用该服务：先保存表单，再切换激活状态
function useService() {
  customStorage.value.baseUrl = form.baseUrl;
  customStorage.value.path = form.path;
  customStorage.value.provider = form.provider;
  customStorage.value.token = form.token;
  customModel.value = form.model;
  customModelApi.value = form.api;
  aiStore.activeService = "custom";
}
</script>

<template>
  <div class="space-y-5">
    <!-- 平台 -->
    <div>
      <label class="mb-2 block text-sm text-sf-text">平台</label>
      <el-select v-model="form.provider" class="w-full" placeholder="请选择平台">
        <el-option
          v-for="item in platformOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>

    <!-- 模型 -->
    <div>
      <label class="mb-2 block text-sm text-sf-text">模型</label>
      <el-select v-model="form.model" class="w-full" placeholder="请选择模型">
        <el-option
          v-for="item in modelOptionsMap[form.provider] || modelOptionsMap.custom"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>

    <!-- Token -->
    <div>
      <label class="mb-2 block text-sm text-sf-text">Token</label>
      <el-input v-model="form.token" type="password" show-password placeholder="请输入 Token" />
    </div>

    <!-- 接口地址 -->
    <div>
      <label class="mb-2 block text-sm text-sf-text">接口地址 (URL)</label>
      <el-input v-model="form.baseUrl" placeholder="如：http://localhost:3000/llm/stream" />
    </div>

    <!-- 路径 -->
    <div>
      <label class="mb-2 block text-sm text-sf-text">路径 (Path)</label>
      <el-input v-model="form.path" placeholder="可选，如：/chat/completions" />
    </div>

    <!-- 自定义模型 API（customModelApi） -->
    <div>
      <label class="mb-2 block text-sm text-sf-text">自定义模型 API</label>
      <el-input v-model="form.api" placeholder="如：/v1/chat/completions" />
    </div>

    <!-- 使用该服务按钮 -->
    <el-button type="primary" class="w-full" :disabled="isActive()" @click="useService">
      {{ isActive() ? "已选择" : "使用该服务" }}
    </el-button>
  </div>
</template>
