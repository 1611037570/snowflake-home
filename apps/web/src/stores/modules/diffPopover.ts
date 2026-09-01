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
  const rect = ref<any>(null);
  const direction = ref("up");
  const align = ref("left");

  // 延迟隐藏定时器，给鼠标从字段移动到悬浮层留出时间
  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  function show(payload: {
    field: any;
    value: string;
    newValue: string;
    html: boolean;
    rect: any;
    direction: string;
    align: string;
  }) {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    field.value = markRaw(payload.field);
    value.value = payload.value;
    newValue.value = payload.newValue;
    html.value = payload.html;
    rect.value = payload.rect;
    direction.value = payload.direction;
    align.value = payload.align;
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
    rect,
    direction,
    align,
    show,
    hide,
    stay,
    keep,
    cancel,
  };
});
