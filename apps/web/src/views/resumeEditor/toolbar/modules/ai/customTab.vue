<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { ElMessageBox, ElMessage } from "element-plus";
import { useAiStore } from "@/stores/modules/ai";
import type { ModelItem } from "@/stores/modules/ai";
import { LLM } from "@/apis";

const props = defineProps<{
  modelId: string;
  editingModel?: ModelItem;
  initializing: boolean;
}>();

const emit = defineEmits<{
  save: [data: { name: string; model: string; key: string; url: string; provider: string }];
  cancel: [];
  removeCurrentModel: [];
}>();

// ========== 表单数据 ==========

/**
 * 当前正在编辑的源对象。pending 模式指向 customModelList 中的项（直接修改即更新 store）；
 * 编辑模式指向一个本地副本，保存时 emit 出去。
 */
const formSource = ref<{ name: string; model: string; key: string; url: string; provider: string } | null>(null);

const formRef = ref();
const testing = ref(false);
const testPassed = ref(false);

// 各服务商获取 Key 的链接
const keyLinks: Record<string, string> = {
  openai: "https://platform.openai.com/api-keys",
  ark: "https://console.volcengine.com/ark",
  deepseek: "https://platform.deepseek.com/",
};
const keyLink = computed(() => keyLinks[props.modelId] || "");

// ========== 状态标记 ==========

// 是否正在查看一个未提交的草稿（可保存为新模型）
const isDraftMode = computed(() => props.modelId.startsWith("pending-"));

// ========== 监听器 ==========

watch(
  () => props.modelId,
  (newId) => {
    // 如果是 pending 模式且该提供商还没有对应的草稿，自动创建
    if (newId.startsWith("pending-")) {
      const provider = newId.replace("pending-", "");
      const aiStore = useAiStore();
      const { customModelList } = storeToRefs(aiStore);
      if (!customModelList.value.some((item: { provider: string }) => item.provider === provider)) {
        aiStore.createPendingModel(provider);
      }
    }
    // 切换模型时重置测试通过状态
    testPassed.value = false;

    // 设置表单数据
    if (newId === "snowflake") {
      formSource.value = null;
      return;
    }
    if (isDraftMode.value) {
      // pending 模式：直接引用 customModelList 中的对象（v-model 改的就是它本身）
      const aiStore = useAiStore();
      const { customModelList } = storeToRefs(aiStore);
      const provider = newId.replace("pending-", "");
      formSource.value = customModelList.value.find((item: { provider: string }) => item.provider === provider) ?? null;
    } else {
      // 编辑模式：用本地副本，不改 prop
      formSource.value = props.editingModel
        ? { name: props.editingModel.name ?? "", model: props.editingModel.model, key: props.editingModel.key, url: props.editingModel.url, provider: props.editingModel.provider }
        : null;
    }
  },
  { immediate: true },
);

// ========== 方法 ==========

/** 连接测试 */
async function handleTestConnection() {
  const src = formSource.value;
  if (!src) return;

  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid && !props.initializing) return;

  testing.value = true;
  try {
    const llm = new LLM({
      url: src.url,
      apiKey: src.key,
      provider: isDraftMode.value ? props.modelId.replace("pending-", "") : src.provider,
    });
    await llm.ping();
    ElMessage.success("添加模型成功");
    testPassed.value = true;
  } catch (error: any) {
    ElMessage.error(error?.message || "添加模型失败");
    testPassed.value = false;
  } finally {
    testing.value = false;
  }
}

/** 提交模型（仅草稿模式需要测试通过） */
function handleSubmit() {
  const src = formSource.value;
  if (!src) return;

  // 草稿模式需要先测试通过
  if (isDraftMode.value && !testPassed.value) {
    handleTestConnection();
    return;
  }

  emit("save", {
    name: src.name,
    model: src.model,
    key: src.key,
    url: src.url,
    provider: isDraftMode.value ? props.modelId.replace("pending-", "") : src.provider,
  });
}

/** 取消 */
function handleCancel() {
  emit("cancel");
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
    <form v-else-if="formSource" class="flex flex-col gap-3" @submit.prevent="handleSubmit">
      <!-- 标题行：平台名 + 删除按钮 -->
      <div class="flex items-center justify-between">
        <span class="font-bold text-sf-text">{{
          keyLinks[isDraftMode ? props.modelId.replace("pending-", "") : formSource!.provider]?.replace(/:/g, '')
            || (isDraftMode ? props.modelId.replace("pending-", "") : formSource!.provider)
        }}{{ isDraftMode ? ' - 新模型' : '' }}</span>
        <el-button v-if="!isDraftMode" text size="small" type="danger" @click="handleRemoveModelClick">
          删除
        </el-button>
      </div>

      <!-- 别名 -->
      <div>
        <label class="mb-1 block text-xs text-sf-text-2">别名（可选）</label>
        <SfInput v-model="formSource!.name" class="w-full" placeholder="如：我的 GPT-4" />
      </div>

      <!-- 模型标识 -->
      <SfFormItem label="模型" prop="model">
        <SfInput v-model="formSource!.model" class="w-full" placeholder="请输入模型名称" />
      </SfFormItem>

      <!-- API Key -->
      <div>
        <div class="mb-1 flex h-5 w-full items-center justify-between">
          <span class="pl-2 font-bold text-sf-text">API Key</span>
          <a :href="keyLink" target="_blank" rel="noopener" class="cursor-pointer text-xs text-sf-theme hover:underline">获取key</a>
        </div>
        <SfFormItem prop="key">
          <SfInput v-model="formSource!.key" type="password" show-password class="w-full" placeholder="请输入 API Key" />
        </SfFormItem>
      </div>

      <!-- 接口地址 -->
      <SfFormItem label="接口地址 (完整URL)" prop="url">
        <SfInput v-model="formSource!.url" placeholder="如：https://api.openai.com/v1/chat/completions" />
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
          <el-button type="primary" class="flex-1" :loading="testing" @click="handleTestConnection">
            {{ testing ? '测试中...' : '添加模型' }}
          </el-button>
          <el-button class="flex-1" @click="handleCancel">取消</el-button>
        </template>
        <!-- 编辑模式：保存 + 取消 -->
        <template v-else>
          <el-button type="primary" class="flex-1" :disabled="!formSource!.name || formSource!.name.trim().length === 0" @click="handleSubmit">保存</el-button>
          <el-button class="flex-1" @click="handleCancel">取消</el-button>
        </template>
      </div>
    </form>

    <!-- 无内容 -->
    <div v-else class="flex flex-1 items-center justify-center text-sm text-sf-text-3">暂无配置信息</div>
  </div>
</template>

<style scoped></style>
