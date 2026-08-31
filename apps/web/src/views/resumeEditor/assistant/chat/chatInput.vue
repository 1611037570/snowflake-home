<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAiStore, useResumeStore } from "@/stores";
import { useModuleNav } from "../../useModuleNav";
import AiNotice from "./aiNotice.vue";

const aiStore = useAiStore();
const resumeStore = useResumeStore();
const { thinkMode } = storeToRefs(aiStore);
const { selectedModule } = storeToRefs(resumeStore);
// 模块导航数据源：全部简历模块
const { moduleList } = useModuleNav();

// 可选模块列表：基于模块导航数据源派生，标记是否已选中
const moduleOptions = computed(() =>
  moduleList.value.map((m) => ({
    key: m.key,
    name: m.name,
    icon: m.icon,
    active: selectedModule.value.some((item) => item.key === m.key),
  })),
);

// 模块选择面板显隐
const modulePanelVisible = ref(false);
const modulePanelRef = ref(null);
// 点击面板外区域收起
const closeModulePanel = (e) => {
  if (
    modulePanelVisible.value &&
    modulePanelRef.value &&
    !modulePanelRef.value.contains(e.target)
  ) {
    modulePanelVisible.value = false;
  }
};
// 切换模块选中状态
const toggleModule = (item) => {
  const index = selectedModule.value.findIndex((m) => m.key === item.key);
  if (index > -1) {
    selectedModule.value.splice(index, 1);
  } else {
    selectedModule.value.push({ key: item.key, name: item.name });
  }
};

// 是否正在生成回复，由父组件（index.vue）控制
const props = defineProps({
  isGenerating: {
    type: Boolean,
    default: false,
  },
});

// 发送 / 停止事件
const emit = defineEmits(["send", "stop"]);

// 输入框绑定的值
const modelValue = ref("");
const inputRef = ref(null);

// 思考模式配置
const thinkModes = [
  {
    name: "快速模式",
    value: false,
  },
  {
    name: "深度思考",
    value: true,
  },
];

// 计算是否可以发送消息
const canSend = computed(() => !!modelValue.value.trim() && !props.isGenerating);

// 动态动作按钮配置
const actionButtonConfig = computed(() => {
  if (props.isGenerating) {
    return {
      icon: "ph:stop-circle-fill",
      title: "停止生成",
      class:
        "bg-sf-error/10 text-sf-error shadow-sm hover:bg-sf-error hover:text-white active:scale-95",
      handler: () => emit("stop"),
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
  document.addEventListener("click", closeModulePanel);
});
// 组件卸载时移除面板外点击监听
onBeforeUnmount(() => document.removeEventListener("click", closeModulePanel));
</script>

<template>
  <footer class="relative flex w-full flex-col items-center p-3">
    <div class="relative z-10 w-full max-w-4xl">
      <!-- 主输入容器：增强阴影与圆角细节 -->
      <div
        class="group hover:border-sf-b-hover relative flex flex-col rounded-3xl border border-sf-b bg-sf-bg p-1 shadow-sm transition-all duration-500"
      >
        <!-- 输入框区域 -->
        <el-input
          ref="inputRef"
          v-model="modelValue"
          type="textarea"
          rows="1"
          :autosize="{ minRows: 1, maxRows: 5 }"
          placeholder="按 Enter 发送，Shift + Enter 换行..."
          class="ai-input"
          resize="none"
          @keydown.enter="handleKeydown"
        />

        <!-- 底部工具栏 -->
        <div class="flex items-center justify-between px-1 pb-1">
          <!-- 左侧：模式切换 -->
          <div ref="modulePanelRef" class="relative">
            <div
              class="cursor-pointer rounded-3xl border border-sf-b bg-sf-bg-2 px-2 py-1 text-sm"
              @click="modulePanelVisible = !modulePanelVisible"
            >
              已选
              <span class="text-sf-theme">
                {{ selectedModule.length }}
              </span>
              模块
            </div>
            <!-- 模块选择面板：从按钮上方弹出 -->
            <div
              v-if="modulePanelVisible"
              class="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-2xl border border-sf-b bg-sf-primary p-1.5 shadow-lg"
            >
              <SfList :list="moduleOptions" @onClick="toggleModule" />
            </div>
          </div>
          <div class="flex items-center rounded-xl bg-sf-primary p-1" v-if="0">
            <button
              v-for="mode in thinkModes"
              :key="mode.value"
              class="relative cursor-pointer rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-300"
              :class="
                thinkMode == mode.value
                  ? 'bg-sf-theme text-white'
                  : 'text-sf-text-3 hover:bg-sf-bg-2 hover:text-sf-text'
              "
              @click="thinkMode = !thinkMode"
            >
              {{ mode.name }}
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

      <AiNotice />
    </div>
  </footer>
</template>

<style scoped>
:deep(.ai-input .el-textarea__inner::placeholder) {
  color: var(--color-sf-text-3);
}
</style>
