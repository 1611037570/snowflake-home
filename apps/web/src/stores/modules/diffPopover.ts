import { defineStore } from "pinia";
import { markRaw, ref } from "vue";

// 简历预览 AI 草稿悬浮对比的全局单例状态，避免每个字段各自维护一套悬浮层 DOM
export const useDiffPopoverStore = defineStore("diffPopover", () => {
  const visible = ref(false);
  // 当前 hover 字段的代理对象引用，保留/放弃时直接写回
  const field = ref<any>(null);
  const value = ref("");
  const newValue = ref("");
  const html = ref(false);
  // 触发时的鼠标坐标，浮层按其定位并收敛到屏幕内
  const x = ref(0);
  const y = ref(0);

  // 延迟隐藏定时器，给鼠标从字段移动到悬浮层留出时间
  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  function show(payload: {
    field: any;
    value: string;
    newValue: string;
    html: boolean;
    x: number;
    y: number;
  }) {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    field.value = markRaw(payload.field);
    value.value = payload.value;
    newValue.value = payload.newValue;
    html.value = payload.html;
    x.value = payload.x;
    y.value = payload.y;
    visible.value = true;
  }

  function hide() {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      visible.value = false;
      field.value = null;
      hideTimer = null;
    }, 200);
  }

  function stay() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  function keep() {
    if (field.value) {
      field.value.value = newValue.value;
    }
    visible.value = false;
    field.value = null;
  }

  function cancel() {
    if (field.value) {
      field.value.newValue = "";
    }
    visible.value = false;
    field.value = null;
  }

  return {
    visible,
    field,
    value,
    newValue,
    html,
    x,
    y,
    show,
    hide,
    stay,
    keep,
    cancel,
  };
});
