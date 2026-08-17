<template>
  <div class="relative w-auto" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div
      v-show="isHovered"
      class="absolute bottom-full left-0 z-10 mb-1 flex h-7 items-center gap-x-2"
    >
      <div
        class="flex-c h-full w-[45px] cursor-pointer rounded border-none bg-[#2e7d32] px-1.5 text-[11px] text-white"
        @click.stop="handleSave"
      >
        保留
      </div>
      <div
        class="flex-c h-full w-[45px] cursor-pointer rounded border-none bg-[#999] px-1.5 text-[11px] text-white"
        @click.stop="handleCancel"
      >
        放弃
      </div>
    </div>
    <div class="w-full rounded-xl" :class="displayClass">
      {{ modelProxy.newValue ? displayContent : valueContent }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useTimeoutFn } from "@vueuse/core";

// 唯一模式：直接传 field 代理对象（{ value, newValue }），使用默认 model 名
const model = defineModel();

// 可选：value 侧的显示覆盖。用于原始 value 需要格式化展示的场景（如时间数组、年龄计算值等）
const props = defineProps({
  displayValue: {
    type: String,
    default: "",
  },
});

// 内部统一的 value 文本（优先 displayValue，否则取 model.value）
const valueContent = computed(() => {
  if (
    props.displayValue !== "" &&
    props.displayValue !== undefined &&
    props.displayValue !== null
  ) {
    return props.displayValue;
  }
  return model.value?.value ?? "";
});

// 内部统一的 newValue 读写
const modelProxy = computed({
  get() {
    return model.value || { value: "", newValue: "" };
  },
  set(v) {
    model.value = v;
  },
});

// 鼠标悬停状态
const isHovered = ref(false);
// 关闭延迟定时器（使用 VueUse 自动管理，组件卸载时自动清理）
const { start: startHideTimer, stop: stopHideTimer } = useTimeoutFn(
  () => {
    isHovered.value = false;
  },
  200,
  { immediate: false },
);

// 计算当前显示的值（悬停切旧值/默认显示新值）
const displayContent = computed(() => {
  return isHovered.value ? valueContent.value : modelProxy.value.newValue;
});

// 计算当前显示的样式类
const displayClass = computed(() => {
  if (modelProxy.value.newValue) {
    return isHovered.value
      ? "text-[#d32f2f] bg-[#fef0f0] line-through cursor-pointer"
      : "text-[#2e7d32] bg-[#e8f5e9] cursor-pointer";
  }
  return "";
});

// 保留修改
const handleSave = () => {
  modelProxy.value.value = modelProxy.value.newValue;
  modelProxy.value.newValue = "";
  // 任务完成，立即隐藏悬浮窗
  stopHideTimer();
  isHovered.value = false;
};

// 放弃修改
const handleCancel = () => {
  modelProxy.value.newValue = "";
  // 任务完成，立即隐藏悬浮窗
  stopHideTimer();
  isHovered.value = false;
};

// 鼠标进入事件
const handleMouseEnter = () => {
  // 清除关闭定时器
  stopHideTimer();
  // 只有当有旧数据时才显示悬停效果
  if (valueContent.value && modelProxy.value.newValue) {
    isHovered.value = true;
  }
};

// 鼠标离开事件
const handleMouseLeave = () => {
  // 只有当有旧数据时才重置悬停状态
  if (valueContent.value) {
    // 延迟关闭，给用户时间移动到悬浮窗
    startHideTimer();
  }
};
</script>
