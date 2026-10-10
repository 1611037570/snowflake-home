import { onKeyStroke } from "@vueuse/core";
import { onScopeDispose, toValue, watch, type MaybeRefOrGetter } from "vue";

/** 弹层按键处理：ESC 多用于关闭，Enter 多用于确认，未注册的按键不参与仲裁。 */
export type OverlayKeyHandlers = {
  /** ESC 按下且当前层位于最上层时触发 */
  escape?: (event: KeyboardEvent) => void;
  /** Enter 按下且当前层位于最上层时触发 */
  enter?: (event: KeyboardEvent) => void;
};

// 已打开的弹层按键层，数组末尾即最上层，只有最上层响应按键。
const activeLayers: OverlayKeyHandlers[] = [];

/**
 * 弹层按键仲裁：ESC 与 Enter 只交给最上层的弹层，避免叠加弹层被一次按键同时关闭。
 * @param handlers 当前弹层的按键处理函数，以对象引用作为层的标识
 * @param isActive 弹层是否打开，关闭时自动出栈并注销监听
 */
export const useOverlayKeys = (
  handlers: OverlayKeyHandlers,
  isActive: MaybeRefOrGetter<boolean> = true,
) => {
  let stopKeyStroke: (() => void) | null = null;

  // 入栈与出栈都按引用定位，重复同步不会产生重复条目。
  const syncLayer = (active: boolean) => {
    const index = activeLayers.indexOf(handlers);
    if (active) {
      if (index === -1) activeLayers.push(handlers);
    } else if (index !== -1) {
      activeLayers.splice(index, 1);
    }
    // 仅在打开期间监听，避免未打开的弹层常驻 window 监听。
    if (active && !stopKeyStroke) {
      stopKeyStroke = onKeyStroke(["Escape", "Enter"], (event: KeyboardEvent) => {
        // 非最上层直接让位，且不阻断事件，未接入仲裁的监听保持原样。
        if (activeLayers[activeLayers.length - 1] !== handlers) return;
        const handler = event.key === "Escape" ? handlers.escape : handlers.enter;
        handler?.(event);
      });
    } else if (!active && stopKeyStroke) {
      stopKeyStroke();
      stopKeyStroke = null;
    }
  };

  watch(() => toValue(isActive), syncLayer, { immediate: true, flush: "sync" });
  // 卸载时兜底出栈，避免异常关闭路径残留条目使后续弹层按键失灵。
  onScopeDispose(() => syncLayer(false));
};
