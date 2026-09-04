<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { ElMessageBox } from "element-plus";
import { useAiStore } from "@/stores/modules/ai";

const emit = defineEmits<{ jumpAdd: [] }>();

const aiStore = useAiStore();
const { activeModel, modelList } = storeToRefs(aiStore);

// 服务商展示名映射（用于无别名且无模型名时的兜底展示）
const PROVIDER_NAMES: Record<string, string> = {
  openai: "OpenAI",
  ark: "火山方舟 Ark",
  deepseek: "DeepSeek",
};

// 列表数据：已添加的模型（当前使用的打勾），雪花服务不在此渲染
const displayList = computed(() =>
  modelList.value.map((m: any) => ({
    id: m.id,
    name: m.name || m.model || PROVIDER_NAMES[m.provider] || m.provider,
    active: activeModel.value === m.id,
  })),
);

// 点击模型：切换为当前使用模型
function selectModel(item: any) {
  aiStore.activeModel = item.id;
}

// 行内删除已添加的模型（激活项删除后 store 会自动回退雪花服务）
function removeModel(item: any) {
  ElMessageBox.confirm("确定要删除该模型吗？此操作不可恢复。", "删除模型", {
    type: "warning",
  })
    .then(() => {
      aiStore.deleteModel(item.id);
    })
    .catch(() => {});
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <!-- 空态：无已添加模型时提示去添加 -->
    <div v-if="!modelList.length" class="flex h-full flex-col items-center justify-center gap-3">
      <span class="text-sm text-sf-text-3">还没有已添加的模型</span>
      <el-button type="primary" @click="emit('jumpAdd')">去添加</el-button>
    </div>

    <!-- 模型列表：点击切换当前使用，行内提供删除 -->
    <SfList v-else :list="displayList" @onClick="selectModel">
      <template #default="{ item }">
        <div class="flex min-w-0 flex-1 items-center gap-2">
          <span class="truncate">{{ item.name }}</span>
        </div>
        <span
          title="删除该模型"
          class="shrink-0 cursor-pointer text-sf-text-3 hover:text-red-500"
          @mousedown.stop
          @click.stop="removeModel(item)"
        >
          <SfIcon icon="lucide:trash-2" size="3.5" />
        </span>
      </template>
    </SfList>
  </div>
</template>
