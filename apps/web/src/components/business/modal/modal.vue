<template>
  <Teleport to="body">
    <!-- 背景模糊层 -->
    <Transition name="mask" :disabled="performanceMode">
      <div
        v-if="modeValue"
        class="fixed top-0 right-0 bottom-0 left-0 z-80 bg-sf-transparent-4"
        :style="backgroundStyle"
      ></div>
    </Transition>

    <!-- 弹窗外壳 -->
    <Transition name="fade" :disabled="performanceMode">
      <div
        v-if="modeValue"
        ref="mask"
        class="modal-container fixed top-0 right-0 bottom-0 left-0 z-80 flex items-center justify-center"
        @mousemove="handleMouseMove"
      >
        <!-- 弹窗容器 -->
        <div
          id="element"
          ref="elementRef"
          class="shadow-4xl flex max-h-[90vh] max-w-[90vw] flex-col rounded-3xl border border-sf-border bg-sf-bg p-3"
          :style="elementStyle"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        >
          <!-- 标题和关闭按钮 -->
          <div class="relative flex items-center justify-between">
            <div
              class="mb-3 w-full text-center text-2xl font-bold"
              v-if="title"
              :class="titleClass"
            >
              {{ title }}
            </div>
            <div
              class="group flex-c absolute top-0 right-0 z-2 h-9 w-9 cursor-pointer rounded-xl bg-transparent transition-all duration-300 hover:bg-sf-bg-hover"
              @click="modeValue = false"
            >
              <SfIcon
                icon="carbon:close-outline"
                size="6"
                class="transition-all duration-300 group-hover:text-sf-theme"
              />
            </div>
          </div>
          <!-- 内容区域 -->
          <div class="flex-1 overflow-auto">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useSystemStore } from "@/stores/modules/system";
import { onKeyStroke, useScrollLock } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { computed, onUnmounted, ref, useTemplateRef, watch } from "vue";

defineOptions({ name: "SfModal" });

// ==================== Props 定义 ====================
defineProps({
  /** 弹窗标题 */
  title: { type: String, default: "" },
  /** 弹窗标题自定义类名 */
  titleClass: { type: String, default: "" },
});

// ==================== 全局状态 ====================
const systemStore = useSystemStore();
/** 性能模式：开启后禁用所有动效（毛玻璃、3D倾斜、过渡动画） */
const { performanceMode } = storeToRefs(systemStore);

// ==================== 弹窗显隐控制 ====================
const mask = useTemplateRef("mask");
/** 双向绑定弹窗显隐状态 */
const modeValue = defineModel();
/** 锁定背景滚动 */
const isLocked = useScrollLock(document.body);

/** 缓存遮罩层边界信息，避免鼠标移动时重复读取 */
let maskRect = null;

// ==================== 键盘事件 ====================
/** ESC 键监听器的停止函数，用于按需注册/移除 */
let stopKeyStroke = null;

/**
 * 动态注册/移除 ESC 监听，只在弹窗显示时生效
 * - 弹窗打开 → 注册监听，并在 DOM 更新后缓存遮罩层边界
 * - 弹窗关闭 → 移除监听，清除缓存，节省性能
 */
watch(
  modeValue,
  async (val) => {
    isLocked.value = val;
    if (val) {
      stopKeyStroke = onKeyStroke("Escape", () => (modeValue.value = false));
      await nextTick();
      maskRect = mask.value?.getBoundingClientRect() || null;
    } else {
      maskRect = null;
      stopKeyStroke?.();
      stopKeyStroke = null;
    }
  },
  { immediate: true },
);

/** 组件卸载时确保移除监听，避免内存泄漏 */
onUnmounted(() => {
  stopKeyStroke?.();
  stopKeyStroke = null;
  isLocked.value = false;
});

// ==================== 3D 视差倾斜核心逻辑 ====================
/** 鼠标偏移灵敏度系数（数值越小，倾斜越敏感） */
const multiple = 55;
/** 3D 元素 DOM 引用 */
const elementRef = ref(null);
/** 鼠标是否悬浮在卡片上（悬浮时停止倾斜，避免干扰点击） */
const isMouseOverCard = ref(false);

// ---------- 背景模糊样式 ----------
/**
 * 背景遮罩样式
 * - 性能模式：移除毛玻璃模糊，减少 GPU 开销
 * - 正常模式：保留 10px 毛玻璃效果
 */
const backgroundStyle = computed(() =>
  performanceMode.value
    ? {
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        backgroundColor: "var(--sf-transparent)",
      }
    : { backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" },
);

// ---------- 弹窗 3D 倾斜样式 ----------
/**
 * 弹窗主体样式
 * - 性能模式：禁用 transform 和 transition，取消 3D 倾斜
 * - 正常模式：只保留平滑过渡，具体角度通过原生 DOM 操作赋值以绕过 Vue 渲染
 */
const elementStyle = computed(() =>
  performanceMode.value
    ? { transform: "none", transition: "none" }
    : { transition: "transform 0.15s ease-out" },
);

// ---------- 倾斜计算函数 ----------
/**
 * 根据鼠标坐标计算 3D 旋转角度
 * @param {number} clientX - 鼠标在视口中的 X 坐标
 * @param {number} clientY - 鼠标在视口中的 Y 坐标
 *
 * 原理：以弹窗容器中心为原点，鼠标偏移量除以灵敏度系数得出角度，
 * 并限制最大倾斜角度为 ±14 度，避免过度扭曲。
 */
function transformElement(clientX, clientY) {
  // 鼠标悬停在卡片上时停止倾斜，避免干扰点击操作
  if (isMouseOverCard.value) return;
  const element = elementRef.value;
  if (!element) return;

  // 使用缓存的遮罩层边界，作为旋转参考中心
  const { left, top, width, height } = maskRect;
  const centerX = left + width / 2;
  const centerY = top + height / 2;

  // 计算偏移量并转换为角度
  const maxAngle = 14; // 最大倾斜角度限制
  const rx = Math.max(-maxAngle, Math.min(maxAngle, -(clientY - centerY) / multiple));
  const ry = Math.max(-maxAngle, Math.min(maxAngle, (clientX - centerX) / multiple));

  // 直接操作 DOM，避免高频触发 Vue 响应式更新
  element.style.transform = `translateZ(0) rotateX(${rx}deg) rotateY(${ry}deg)`;
}

// ---------- 鼠标事件处理 ----------
let ticking = false;
/**
 * 鼠标在遮罩层上移动时触发倾斜效果
 * 使用 requestAnimationFrame 和 ticking 节流，保证每帧只执行一次
 */
function handleMouseMove(e) {
  if (performanceMode.value) return;
  if (!ticking) {
    requestAnimationFrame(() => {
      transformElement(e.clientX, e.clientY);
      ticking = false;
    });
    ticking = true;
  }
}

/** 鼠标进入弹窗卡片：暂停倾斜并复位角度 */
function handleMouseEnter() {
  if (performanceMode.value) return;
  isMouseOverCard.value = true;
  if (elementRef.value) {
    elementRef.value.style.transform = "translateZ(0) rotateX(0deg) rotateY(0deg)";
  }
}

/** 鼠标离开弹窗卡片：恢复倾斜跟踪 */
function handleMouseLeave() {
  isMouseOverCard.value = false;
}
</script>

<style>
.modal-container {
  perspective: 1300px;
  will-change: transform, opacity;
}

#element {
  /* transition 已移至内联样式，由性能模式控制 */
  will-change: transform;
}

/* ========== 弹窗淡入淡出动画 ========== */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.3);
}

/* ========== 遮罩层淡入淡出动画 ========== */
.mask-enter-active,
.mask-leave-active {
  transition:
    opacity 0.1s ease,
    transform 0.1s ease;
}
.mask-enter-from,
.mask-leave-to {
  opacity: 0;
}
</style>
