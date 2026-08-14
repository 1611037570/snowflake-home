<script setup>
import { useAiSettings } from "@/hooks";

defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const settings = useAiSettings();

const modelOptions = [
  { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
  { label: "GPT-4", value: "gpt-4" },
  { label: "Claude 3 Opus", value: "claude-3-opus" },
  { label: "Gemini Pro", value: "gemini-pro" },
];

const historyOptions = [
  { label: "0 (无历史记录)", value: 0 },
  { label: "5条", value: 5 },
  { label: "10条", value: 10 },
  { label: "20条", value: 20 },
  { label: "50条", value: 50 },
];

const contextLengthOptions = [
  { label: "2000 Tokens", value: 2000 },
  { label: "4000 Tokens", value: 4000 },
  { label: "8000 Tokens", value: 8000 },
  { label: "16000 Tokens", value: 16000 },
  { label: "32000 Tokens", value: 32000 },
];

const temperatureOptions = [
  { label: "0.0 (最精确)", value: 0.0 },
  { label: "0.3", value: 0.3 },
  { label: "0.7 (平衡)", value: 0.7 },
  { label: "1.0 (有创意)", value: 1.0 },
  { label: "1.2 (非常发散)", value: 1.2 },
];
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
    title="对话设置"
    size="480px"
    append-to-body
  >
    <div class="flex flex-col gap-8 p-4">
      <div class="flex flex-col items-center">
        <SfSetTitle title="基础设置" class="w-full max-w-[420px]" />
        <SfSetBox class="w-full max-w-[420px] border border-sf-border/50 shadow-sm">
          <SfSetItem
            title="模型选择"
            info="选择合适的 AI 模型"
            type="select"
            v-model="settings.model"
            :config="{ list: modelOptions }"
          />
          <SfSetItem
            title="上下文消息数"
            info="每次对话携带的历史消息数量"
            type="select"
            v-model="settings.historyCount"
            :config="{ list: historyOptions }"
          />
          <SfSetItem
            title="上下文长度"
            info="每次对话携带的最大 Token 数量"
            type="select"
            v-model="settings.contextLength"
            :config="{ list: contextLengthOptions }"
          />
          <SfSetItem
            title="温度 (Temperature)"
            info="值越大回复越发散，值越小回复越稳定"
            type="select"
            v-model="settings.temperature"
            :config="{ list: temperatureOptions }"
            :divider="false"
          />
        </SfSetBox>
      </div>

      <div class="flex flex-col items-center">
        <SfSetTitle title="高级设置" class="w-full max-w-[420px]" />
        <SfSetBox class="w-full max-w-[420px] border border-sf-border/50 shadow-sm">
          <SfSetItem
            title="联网搜索"
            info="允许 AI 自动检索互联网获取最新信息"
            type="switch"
            v-model="settings.webSearch"
            :divider="false"
          />
        </SfSetBox>
      </div>

      <div class="flex flex-col items-center">
        <SfSetTitle title="界面与交互" class="w-full max-w-[420px]" />
        <SfSetBox class="w-full max-w-[420px] border border-sf-border/50 shadow-sm">
          <div class="p-4 text-center text-xs text-sf-text-3 opacity-60">暂无可配置的交互项</div>
        </SfSetBox>
      </div>

      <div class="flex flex-col items-center">
        <SfSetTitle title="角色设定" class="w-full max-w-[420px]" />
        <SfSetBox class="w-full max-w-[420px] border border-sf-border/50 shadow-sm">
          <div class="p-4 text-sf-text">
            <el-input
              v-model="settings.systemPrompt"
              type="textarea"
              :rows="6"
              placeholder="请输入 AI 助手的角色设定..."
              class="custom-system-prompt"
              resize="none"
            />
          </div>
        </SfSetBox>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
/* 设置项中系统提示词输入框样式 */
:deep(.custom-system-prompt .el-textarea__inner) {
  border: none !important;
  box-shadow: none !important;
  background-color: var(--color-sf-bg-2) !important;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-sf-text);
  transition: box-shadow 0.3s ease;
}
:deep(.custom-system-prompt .el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px var(--color-sf-theme) !important;
}
</style>
