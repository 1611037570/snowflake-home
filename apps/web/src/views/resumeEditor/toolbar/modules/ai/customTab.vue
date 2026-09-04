<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { ElMessageBox, ElMessage } from "element-plus";
import { useAiStore } from "@/stores/modules/ai";
import { LLM } from "@/apis";

const props = defineProps<{
  // 当前查看的模型 ID（snowflake / 已添加模型的 id / pending-xxx）
  modelId: string;
  // 正在编辑的模型数据
  editingModel?: any;
  // 是否为初始化状态（首次打开，跳过验证）
  initializing: boolean;
}>();

const emit = defineEmits<{
  save: [data: { name: string; model: string; key: string; url: string; provider: string }];
  cancel: [];
  removeCurrentModel: [];
}>();

const formRef = ref();
const testing = ref(false);

// 各服务商获取 Key 的链接
const keyLinks: Record<string, string> = {
  openai: "https://platform.openai.com/api-keys",
  ark: "https://console.volcengine.com/ark",
  deepseek: "https://platform.deepseek.com/",
};
const keyLink = computed(() => keyLinks[props.modelId] || "");

// ========== 表单数据 ==========

// 当前正在编辑的配置项
const draft = computed<any>(() => {
  const id = props.modelId;

  // snowflake 内置服务
  if (id === "snowflake") return null;

  // pending-开头：从待添加列表查找
  if (id.startsWith("pending-")) {
    const provider = id.replace("pending-", "");
    const existing = findPendingByProvider(provider);
    return existing || {};
  }

  // 已添加模型
  if (props.editingModel) {
    return props.editingModel;
  }

  return null;
});

/** 根据提供商在待添加列表中查找对应草稿 */
function findPendingByProvider(provider: string): any {
  const aiStore = useAiStore();
  const { customModelList } = storeToRefs(aiStore);
  return customModelList.value.find((item: any) => item.provider === provider);
}

// ========== 状态标记 ==========

// 是否正在查看一个未提交的草稿（可保存为新模型）
const isDraftMode = computed(() => props.modelId.startsWith("pending-"));

// 表单是否有有效的模型名称（用于控制"保存"按钮显示）
const hasValidName = computed(
  () => draft.value && typeof draft.value.name === "string" && draft.value.name.trim().length > 0,
);

// ========== 监听器 ==========

watch(
  () => props.modelId,
  (newId, oldId) => {
    // 如果是 pending 模式且该提供商还没有对应的草稿，自动创建
    if (newId.startsWith("pending-")) {
      const provider = newId.replace("pending-", "");
      if (!findPendingByProvider(provider)) {
        const aiStore = useAiStore();
        aiStore.createPendingModel(provider);
      }
    }
    // 如果不是初始化状态，说明用户主动切换了模型
    if (!props.initializing) {
      // 什么都不做，表单通过 editingModel 和 draft computed 自动更新
    }
  },
  { immediate: true },
);

// 当草稿对象改变时，同步到父组件的 editingModel（编辑模式下）
watch(
  () => draft.value,
  () => {},
);

// ========== 校验规则 ==========
const rules = {
  model: [
    { required: true, pattern: /^\S+$/, message: "请输入有效的模型名称", trigger: "blur" },
  ],
  key: [
    { required: true, pattern: /^\S+$/, message: "请输入有效的 API Key", trigger: "blur" },
  ],
  url: [
    { required: true, pattern: /^https?:\/\/[^\s]+$/, message: "请输入完整的 HTTP(S) 接口地址", trigger: "blur" },
  ],
};

// ========== 方法 ==========

/** 测试连接 / 提交模型 */
async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid && !props.initializing) return;

  // 提取表单数据（去除空字符串字段）
  const data = Object.fromEntries(
    Object.entries(draft.value).filter(([_, v]) => v !== ""),
  ) as any;
  data.provider = props.modelId.startsWith("pending-")
    ? props.modelId.replace("pending-", "")
    : data.provider;

  // 如果是草稿模式，先走 testConnection 验证
  if (isDraftMode.value) {
    await testConnection(data);
    if (!draft.value._testPassed) return;
  }

  emit("save", {
    name: data.name || "",
    model: data.model,
    key: data.key,
    url: data.url,
    provider: data.provider,
  });
}

/** 取消 */
function handleCancel() {
  emit("cancel");
}

/** 连接测试 */
async function testConnection(data: any) {
  testing.value = true;
  try {
    const llm = new LLM({
      url: data.url,
      apiKey: data.key,
      provider: data.provider,
    });
    await llm.ping();
    ElMessage.success("添加模型成功");
    draft.value._testPassed = true;
  } catch (error: any) {
    ElMessage.error(error?.message || "添加模型失败");
  } finally {
    testing.value = false;
  }
}

/** 删除当前已添加的模型 */
function handleRemoveModelClick() {
  if (!props.editingModel) return;
  ElMessageBox.confirm("确定要删除该模型吗？此操作不可恢复。", "删除模型", {
    type: "warning",
  })
    .then(() => {
      emit("remove-current-model");
    })
    .catch(() => {});
}
</script>

<template>
  <div class="flex h-full flex-1 flex-col gap-4 overflow-y-auto p-4">
    <!-- Snowflake 内置服务 -->
    <div v-if="modelId === 'snowflake'" class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <span class="font-bold text-sf-text">雪花服务</span>
        <el-tag type="success">已连接</el-tag>
      </div>
      <div class="text-sm text-sf-text-3">余额充足 · 默认 AI 服务提供商</div>
      <div class="mt-auto pt-3">
        <el-button type="primary" disabled class="w-full">已选择</el-button>
      </div>
    </div>

    <!-- 待添加 / 编辑模型表单 -->
    <form v-else-if="draft" class="flex flex-col gap-3" @submit.prevent="handleSave">
      <!-- 标题行：平台名 + 删除按钮 -->
      <div class="flex items-center justify-between">
        <span class="font-bold text-sf-text">{{ keyLinks[draft.provider]?.replace(/:/g, '') || draft.provider }}{{ isDraftMode ? ' - 新模型' : '' }}</span>
        <el-button v-if="!isDraftMode" text size="small" type="danger" @click="handleRemoveModelClick">
          删除
        </el-button>
      </div>

      <!-- 别名 -->
      <div>
        <label class="mb-1 block text-xs text-sf-text-2">别名（可选）</label>
        <SfInput v-model="draft.name" class="w-full" placeholder="如：我的 GPT-4" />
      </div>

      <!-- 模型标识 -->
      <SfFormItem label="模型" prop="model">
        <SfInput v-model="draft.model" class="w-full" placeholder="请输入模型名称" />
      </SfFormItem>

      <!-- API Key -->
      <div>
        <div class="mb-1 flex h-5 w-full items-center justify-between">
          <span class="pl-2 font-bold text-sf-text">API Key</span>
          <a :href="keyLink" target="_blank" rel="noopener" class="cursor-pointer text-xs text-sf-theme hover:underline">获取key</a>
        </div>
        <SfFormItem prop="key">
          <SfInput v-model="draft.key" type="password" show-password class="w-full" placeholder="请输入 API Key" />
        </SfFormItem>
      </div>

      <!-- 接口地址 -->
      <SfFormItem label="接口地址 (完整URL)" prop="url">
        <SfInput v-model="draft.url" placeholder="如：https://api.openai.com/v1/chat/completions" />
      </SfFormItem>

      <!-- 提示 -->
      <div class="flex items-center text-xs text-sf-text-3">
        <SfIcon icon="mdi:information-variant" size="3.5" class="mr-1" />
        项目会强制开启深度思考，推荐使用最新模型获取更智能的回复。
      </div>

      <!-- 按钮区域 -->
      <div class="flex gap-3">
        <!-- 草稿模式：测试连接 + 添加 -->
        <template v-if="isDraftMode">
          <el-button type="primary" class="flex-1" :loading="testing" @click="handleSave">
            {{ testing ? '测试中...' : '添加模型' }}
          </el-button>
          <el-button class="flex-1" @click="handleCancel">取消</el-button>
        </template>
        <!-- 编辑模式：保存 + 取消 -->
        <template v-else>
          <el-button type="primary" class="flex-1" @click="handleSave" :disabled="!hasValidName">保存</el-button>
          <el-button class="flex-1" @click="handleCancel">取消</el-button>
        </template>
      </div>
    </form>

    <!-- 无内容 -->
    <div v-else class="flex flex-1 items-center justify-center text-sm text-sf-text-3">暂无配置信息</div>
  </div>
</template>

<style scoped></style>
