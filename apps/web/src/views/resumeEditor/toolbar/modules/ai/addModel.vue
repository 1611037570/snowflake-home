<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import { useAiStore } from "@/stores/modules/ai";
import { LLM } from "@/apis";

const aiStore = useAiStore();

// 可添加的服务商模板（不含内置雪花服务）
const providerTemplates = [
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

// 左侧服务商列表：内置雪花服务置顶展示，不参与添加
const providerList = computed(() => [
  { id: "snowflake", name: "雪花服务", builtin: true },
  ...providerTemplates,
]);

// 当前选中的服务商（默认选中第一个可添加服务商）
const selectedProvider = ref("openai");
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

// 使用内置雪花服务（非当前使用时展示该入口）
function useSnowflake() {
  aiStore.activeModel = "snowflake";
}

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
}
</script>

<template>
  <div class="flex h-full min-h-0 gap-4">
    <!-- 左侧：服务商列表（雪花服务置顶 + 可添加服务商） -->
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

    <!-- 右侧：雪花卡片 / 新增模型表单 -->
    <div class="flex h-full min-h-0 flex-1 flex-col gap-4 p-4">
      <!-- 雪花服务卡片 -->
      <div v-if="selectedProvider === 'snowflake'" class="flex flex-1 flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="font-bold text-sf-text">雪花服务</span>
          <el-tag type="success">已连接</el-tag>
        </div>
        <div class="text-sm text-sf-text-3">余额充足 · 默认 AI 服务提供商</div>
        <div class="mt-auto pt-3">
          <el-button
            type="primary"
            class="w-full"
            :disabled="aiStore.activeModel === 'snowflake'"
            @click="useSnowflake"
          >
            {{ aiStore.activeModel === "snowflake" ? "已选择" : "使用该服务" }}
          </el-button>
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
