<script setup>
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAiStore, useResumeStore } from "@/stores";
import { arkLLM } from "@/apis";
const resumeStore = useResumeStore();
const { currentData } = storeToRefs(resumeStore);

const aiStore = useAiStore();
const { thinkMode } = storeToRefs(aiStore);
const { createDefaultMessage } = useAiStore();

// 从父组件注入当前消息列表
const currentMessages = inject("currentMessages");
// 从父组件注入当前对话类型
const currentType = inject("type");

// 输入框绑定的值
const modelValue = ref("");
// 中止请求的函数
let abortRequest = null;
// 是否正在发送中
const isSending = ref(false);
const inputRef = ref(null);
// 从父组件注入当前对话
const chat = inject("chat");
// 从父组件注入滚动到底部的方法
const scrollToBottom = inject("scrollToBottom");

// 思考模式配置
const thinkModes = [
  {
    key: "fast",
    label: "快速模式",
    activeClass: "bg-sf-bg-3 text-sf-text",
  },
  {
    key: "deep",
    label: "深度思考",
    activeClass: "bg-sf-theme text-white ",
  },
];

// 计算是否可以发送消息
const canSend = computed(() => !!modelValue.value.trim() && !isSending.value);

// 动态动作按钮配置
const actionButtonConfig = computed(() => {
  if (isSending.value) {
    return {
      icon: "ph:stop-circle-fill",
      title: "停止生成",
      class:
        "bg-sf-error/10 text-sf-error shadow-sm hover:bg-sf-error hover:text-white active:scale-95",
      handler: () => stopGenerating(),
      disabled: false,
    };
  }
  return {
    icon: "ph:paper-plane-right-fill",
    title: "发送消息",
    class: canSend.value
      ? "cursor-pointer bg-sf-theme text-white shadow-lg shadow-sf-theme/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sf-theme/35 active:translate-y-0 active:scale-95"
      : "cursor-not-allowed bg-sf-bg-3 text-sf-text opacity-50",
    handler: () => handleSend(),
    disabled: !canSend.value,
  };
});
/**
 * 向当前对话追加一条消息
 */
function addMessage(msg) {
  chat.value.messages.push({
    ...createDefaultMessage(),
    ...msg,
  });
  chat.value.updateTime = Date.now();
}
const handleInput = (val) => {
  modelValue.value = val;
};
/**
 * 处理发送消息
 */

const handleSend = async () => {
  const content = modelValue.value.trim();
  // 确保输入内容不为空
  if (!content) {
    console.log("没有内容:>> ");
    return;
  }
  // 确保当前没有正在发送的消息
  if (isSending.value) {
    console.log("正在发送:>> ");
    return;
  }
  isSending.value = true;
  console.log("1111:>> ", 1111);
  try {
    addMessage({
      role: "user",
      content,
      typing: false,
    });

    modelValue.value = "";
    scrollToBottom();
    nextTick(() => inputRef.value?.focus());
    scrollToBottom();

    // 触发真实请求
    handleAIResponse();
  } catch {
    isSending.value = false;
  }
};

/**
 * 处理 AI 回复的真实请求
 */
const handleAIResponse = async () => {
  // 保存最后一条消息的引用，用于流式更新内容
  let lastMsg = null;
  try {
    // 从当前消息列表中提取 role 和 content，组装成发送给 AI 的请求消息
    const messages = currentMessages.value.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    // 属于简历项目
    if (currentType === "resume") {
      // 拼接 prompt 和 content 为一条消息
      const prompt = `data: ${JSON.stringify(currentData.value)}

      `;
      messages.at(-1).content = prompt + messages.at(-1).content;
    }
    // 先添加一条空的助手消息，用于展示打字中状态和流式内容
    addMessage({
      role: "assistant",
      content: "",
      typing: true,
    });

    // 获取刚添加的这条助手消息引用
    lastMsg = currentMessages.value[currentMessages.value.length - 1];
    // 思考状态，初始为 false
    let thoughtStatus = false;
    // 调用豆包大模型流式接口
    const { sendFn, abortFn } = await arkLLM.request({
      options: {
        input: messages,
        model: "deepseek-v4-flash-ga-260731",
        thinking: {
          // 根据设置控制深度思考模式
          // type: thinkMode.value ? "enabled" : "disabled",
          type: "disabled",
        }, // 👈 这个就是【深度思考开关】
      },
      stream: true, // 开启流式响应
      // 简历模式下，需要解析 JSON 字符串
      isJson: currentType === "resume" ? true : false,
      // 流式事件回调（非JSON格式）
      onEvent: (type, data) => {
        if (type === "reasoning") {
          // 追加思考内容并滚动到底部
          lastMsg.thought += data;
          scrollToBottom();
        } else if (type === "content") {
          // 思考展开，并且首次收到回复内容，标记为完成。
          if (!lastMsg.thoughtCollapsed && !thoughtStatus) {
            thoughtStatus = true;
            lastMsg.thoughtCollapsed = true;
          }
          // 回复正文事件：逐字追加内容并滚动到底部
          lastMsg.content += data;
          scrollToBottom();
        } else if (type === "total_tokens") {
          // token 统计事件：保存本次消耗的 token 数
          lastMsg.total_tokens = data;
        }
      },
      // 请求失败回调
      onFail: (error) => {
        lastMsg.content = `请求出错: ${error.message || "未知错误"}`;
        lastMsg.typing = false;
        isSending.value = false;
        // 更新请求状态为失败状态
        lastMsg.requestStatus = "error";
      },
      // 请求成功回调（JSON格式）
      onSuccess: (res) => {
        console.log("res:>> ", res);

        // 更新请求状态为成功状态
        lastMsg.requestStatus = "success";
      },
    });

    // 保存中止函数，供外部停止生成时调用
    abortRequest = abortFn;
    // 执行发送请求
    await sendFn();
  } catch (error) {
    // 捕获异常并打印
    console.error("AI 请求异常:", error);
  } finally {
    // 无论成功失败，统一清理状态
    isSending.value = false;
    abortRequest = null;
    // 确保打字状态被关闭
    if (lastMsg?.typing) {
      lastMsg.typing = false;
    }
    // 更新对话的最后修改时间
    if (chat.value) {
      chat.value.updateTime = Date.now();
    }
  }
};

/**
 * 停止生成
 */
const stopGenerating = () => {
  isSending.value = false;
  if (abortRequest) {
    abortRequest();
    abortRequest = null;
  }
  // 确保所有消息的打字状态都重置
  currentMessages.value.forEach((msg) => {
    if (msg.typing) {
      msg.typing = false;
    }
  });
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
defineExpose({ focus });

onMounted(() => {
  focus();
});
</script>

<template>
  <footer class="relative flex w-full flex-col items-center p-3">
    <div class="relative z-10 w-full max-w-4xl">
      <!-- 主输入容器：增强阴影与圆角细节 -->
      <div
        class="group hover:border-sf-border-hover relative flex flex-col rounded-2xl border border-sf-border bg-sf-bg p-1 shadow-sm transition-all duration-500"
      >
        <!-- 输入框区域 -->
        <el-input
          ref="inputRef"
          :model-value="modelValue"
          @update:model-value="handleInput"
          type="textarea"
          rows="1"
          :autosize="{ minRows: 1, maxRows: 5 }"
          :placeholder="'按 Enter 发送，Shift + Enter 换行...'"
          class="ai-input"
          resize="none"
          @keydown.enter="handleKeydown"
        />

        <!-- 底部工具栏 -->
        <div class="flex items-center justify-between px-1 pb-1">
          <!-- 左侧：模式切换 -->
          <div class="flex items-center rounded-xl bg-sf-primary p-1">
            <button
              v-for="mode in thinkModes"
              :key="mode.key"
              class="relative cursor-pointer rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-300"
              :class="
                thinkMode === mode.key
                  ? mode.activeClass
                  : 'text-sf-text-3 hover:bg-sf-bg-2 hover:text-sf-text'
              "
              @click="thinkMode = !thinkMode"
            >
              {{ mode.label }}
            </button>
          </div>

          <!-- 右侧：动态动作按钮 (发送/停止) -->
          <button
            class="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-500 ease-out"
            :class="actionButtonConfig.class"
            :title="actionButtonConfig.title"
            :disabled="actionButtonConfig.disabled"
            @click="actionButtonConfig.handler"
          >
            <SfIcon
              :icon="actionButtonConfig.icon"
              size="4.5"
              class="transition-all duration-500"
              :class="{
                'group-focus-within:scale-110 ': canSend,
              }"
            />
          </button>
        </div>
      </div>

      <!-- 底部免责声明 -->
      <small
        class="mt-3 flex items-center justify-center gap-1.5 text-[11px] tracking-wider text-sf-text-3 opacity-60 transition-opacity hover:opacity-100"
      >
        <SfIcon icon="ph:info-duotone" size="3" />
        <span>ai生成仅供参考，请保持独立思考。</span>
      </small>
    </div>
  </footer>
</template>

<style scoped>
:deep(.ai-input .el-textarea__inner::placeholder) {
  color: var(--color-sf-text-3);
}
</style>
