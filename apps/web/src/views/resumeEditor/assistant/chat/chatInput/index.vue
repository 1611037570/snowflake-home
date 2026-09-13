<script setup>
import { ElMessage } from "element-plus";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import AiNotice from "../aiNotice.vue";
import DesensitizeMode from "./desensitizeMode.vue";
import ModuleSelect from "./moduleSelect.vue";
import ModelSelect from "./modelSelect.vue";

// 是否正在生成回复，由父组件（index.vue）控制
const props = defineProps({
  isGenerating: {
    type: Boolean,
    default: false,
  },
  voiceEnabled: {
    type: Boolean,
    default: false,
  },
});

// 发送 / 停止事件
const emit = defineEmits(["send", "stop"]);

// 输入框绑定的值
const modelValue = ref("");
const inputRef = ref(null);
const recognition = ref(null);
const isListening = ref(false);
const speechBaseValue = ref("");

// 浏览器提供语音识别能力时，专项面试可将语音实时转写到输入框
const getSpeechRecognition = () => window.SpeechRecognition || window.webkitSpeechRecognition;
const isVoiceSupported = computed(() => props.voiceEnabled && !!getSpeechRecognition());

const stopVoiceInput = () => {
  recognition.value?.stop();
  recognition.value = null;
  isListening.value = false;
};

const toggleVoiceInput = () => {
  if (isListening.value) {
    stopVoiceInput();
    return;
  }
  const SpeechRecognition = getSpeechRecognition();
  if (!SpeechRecognition) {
    ElMessage.warning("当前浏览器不支持语音输入，请使用文字作答");
    return;
  }
  // 每次开始录音时保留已有文字，识别结果仅追加到本轮输入
  const instance = new SpeechRecognition();
  speechBaseValue.value = modelValue.value.trim();
  instance.lang = navigator.language || "zh-CN";
  instance.continuous = true;
  instance.interimResults = true;
  instance.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript || "")
      .join("")
      .trim();
    modelValue.value = [speechBaseValue.value, transcript].filter(Boolean).join(" ");
  };
  instance.onerror = () => {
    ElMessage.warning("语音识别失败，请重试或使用文字作答");
  };
  instance.onend = () => {
    recognition.value = null;
    isListening.value = false;
  };
  recognition.value = instance;
  isListening.value = true;
  instance.start();
};

// 离开专项面试输入模式时立即停止仍在进行的语音识别
watch(
  () => props.voiceEnabled,
  (enabled) => {
    if (!enabled && isListening.value) stopVoiceInput();
  },
);

// 计算是否可以发送消息
const canSend = computed(() => !!modelValue.value.trim() && !props.isGenerating);

// 动态动作按钮配置
const actionButtonConfig = computed(() => {
  if (props.isGenerating) {
    return {
      icon: "ph:stop-circle-fill",
      title: "停止生成",
      class:
        "bg-sf-error-2 text-sf-error shadow-sm hover:bg-sf-error hover:text-white active:scale-95",
      handler: () => emit("stop"),
      disabled: false,
    };
  }
  return {
    icon: "mdi:arrow-up",
    title: "发送消息",
    class: canSend.value
      ? "cursor-pointer bg-sf-theme text-white  hover:-translate-y-0.5  active:translate-y-0 active:scale-95"
      : "cursor-not-allowed bg-sf-bg-3 text-sf-text opacity-50",
    handler: () => handleSend(),
    disabled: !canSend.value,
  };
});

/**
 * 处理发送消息：清空输入框并通知父组件发送
 */
const handleSend = () => {
  const content = modelValue.value.trim();
  // 确保输入内容不为空，且当前没有正在发送的消息
  if (!content || props.isGenerating) return;
  // 清空输入框并聚焦，发送逻辑交由父组件处理
  modelValue.value = "";
  nextTick(() => inputRef.value?.focus());
  emit("send", content);
};

const handleKeydown = (e) => {
  // 仅支持 Enter 发送，Shift + Enter 换行
  const isSendKey = !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey;

  if (isSendKey) {
    e.preventDefault();
    if (canSend.value) {
      handleSend();
    }
  }
};

// 暴露 focus 方法给父组件调用
const focus = () => {
  inputRef.value?.focus();
};
// 暴露 setValue 方法，供父组件撤回消息时回填内容
const setValue = (val) => {
  modelValue.value = val;
};
defineExpose({ focus, setValue });

onMounted(() => {
  focus();
});

// 组件销毁时结束录音，避免语音识别继续占用麦克风
onBeforeUnmount(() => {
  stopVoiceInput();
});
</script>

<template>
  <footer class="relative flex w-full flex-col items-center px-3 pt-3">
    <div class="relative z-10 w-full max-w-4xl">
      <!-- 主输入容器：增强阴影与圆角细节 -->
      <div
        class="group hover:border-sf-b-hover relative flex flex-col rounded-3xl border border-sf-b bg-sf-bg p-1 transition-all duration-500"
      >
        <!-- 输入框区域 -->
        <el-input
          ref="inputRef"
          v-model="modelValue"
          type="textarea"
          :rows="1"
          :autosize="{ minRows: 1, maxRows: 5 }"
          placeholder="按 Enter 发送，Shift + Enter 换行..."
          class="ai-input"
          resize="none"
          @keydown.enter="handleKeydown"
        />

        <!-- 底部工具栏 -->
        <div class="flex items-center justify-between px-1 pb-1">
          <!-- 左侧 -->
          <div class="flex min-w-0 flex-1 items-center gap-1">
            <div class="flex flex-col gap-1">
              <ModuleSelect />
              <DesensitizeMode />
            </div>
          </div>
          <!-- 右侧-->
          <div class="flex items-center gap-1">
            <ModelSelect />
            <!-- 专项面试语音入口：识别结果先进入输入框，确认后再发送 -->
            <button
              v-if="props.voiceEnabled"
              data-test="voice-input"
              class="flex h-[30px] w-8 items-center justify-center rounded-xl transition-all duration-500"
              :class="
                isListening
                  ? 'bg-sf-error-2 text-sf-error'
                  : 'bg-sf-bg-3 text-sf-text hover:bg-sf-bg-2'
              "
              :title="isVoiceSupported ? (isListening ? '停止语音输入' : '开始语音输入') : '当前浏览器不支持语音输入'"
              type="button"
              @click="toggleVoiceInput"
            >
              <SfIcon :icon="isListening ? 'ph:stop-circle-fill' : 'ph:microphone-duotone'" size="4" />
            </button>
            <!--动态动作按钮 (发送/停止) -->
            <button
              class="flex h-[30px] w-8 items-center justify-center rounded-xl transition-all duration-500 ease-out"
              :class="actionButtonConfig.class"
              :title="actionButtonConfig.title"
              :disabled="actionButtonConfig.disabled"
              @click="actionButtonConfig.handler"
            >
              <SfIcon
                :icon="actionButtonConfig.icon"
                size="4"
                class="transition-all duration-500"
                :class="{
                  'group-focus-within:scale-110 ': canSend,
                  'cursor-not-allowed!': !canSend,
                }"
              />
            </button>
          </div>
        </div>
      </div>

      <AiNotice />
    </div>
  </footer>
</template>

<style scoped>
:deep(.ai-input .el-textarea__inner::placeholder) {
  color: var(--color-sf-text-3);
}
</style>
