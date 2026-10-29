<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { $t } from "@/locales";
import AiGenerateFlow from "./aiGenerate/aiGenerateFlow.vue";
import {
  useAiResumeGuard,
  type AiGenerateFlowHandle,
  type AiGenerateInput,
} from "./aiGenerate/useAiResumeDraft";

defineOptions({ name: "AiResumeGenerator" });

const emit = defineEmits<{
  // 用户确认预览结果后返回已经套用所选模板的简历数据。
  generated: [item: Record<string, any>];
}>();

const { ensureReady } = useAiResumeGuard();
const visible = ref(false);
const flow = ref<AiGenerateFlowHandle | null>(null);

// 生成结果需要更宽的画布，输入阶段沿用紧凑宽度。
const modalWidth = computed(() => (flow.value?.hasResult ? "min(90vw, 1200px)" : "min(90vw, 720px)"));

// 弹窗入口沿用原有调用方式：带入来源样式、预填资料与已知姓名。
const open = (
  item: Record<string, any>,
  initialInput: Partial<AiGenerateInput> = {},
  initialName = "",
) => {
  if (!ensureReady()) return;
  visible.value = true;
  // 弹窗内容挂载后再写入本轮来源，流程组件只在打开期间存在。
  nextTick(() => flow.value?.start(item, initialInput, initialName));
};

// 关闭弹窗立即中止仍在进行的请求，避免迟到结果创建简历。
watch(visible, (value) => {
  if (!value) flow.value?.reset();
});

// 预览确认后交回入口处理创建，随后关闭弹窗。
const handleConfirm = (item: Record<string, any>) => {
  emit("generated", item);
  visible.value = false;
};

defineExpose({ open });
</script>

<template>
  <SfModal v-model="visible" :title="$t('resumeAiGenerateTitle')" :width="modalWidth">
    <div class="h-[72vh] min-h-[480px]">
      <AiGenerateFlow ref="flow" @confirm="handleConfirm" />
    </div>
  </SfModal>
</template>
