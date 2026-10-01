import { onMounted, onUnmounted } from "vue";

/** 拖拽实例按需启动的参数 */
export interface DragOnDemandOptions {
  /** useDraggable 返回的实例，只用到启动与销毁 */
  draggable: {
    /** 在指定元素上创建拖拽实例 */
    start: (element: HTMLElement) => void;
    /** 销毁拖拽实例 */
    destroy: () => void;
  };
  /** 读取承载拖拽的容器元素 */
  getElement: () => HTMLElement | null;
  /** 读取拖拽把手的选择器 */
  getHandle: () => string;
  /** 当前是否允许拖拽 */
  isEnabled: () => boolean;
}

/**
 * 拖拽实例按需启动。
 *
 * Sortable 实例会持续观察列表 DOM，编辑期一直挂着会让每次输入都多付一份观察开销。
 * 这里改成只在按下拖拽把手时创建实例、手势结束后销毁：捕获阶段监听先于 Sortable
 * 自身的鼠标监听执行，因此按下把手当次就能拖拽，编辑期间不保留任何观察器。
 */
export const useDragOnDemand = ({
  draggable,
  getElement,
  getHandle,
  isEnabled,
}: DragOnDemandOptions) => {
  let started = false;
  let destroyTimer = 0;

  const stopDraggable = () => {
    if (!started) return;
    started = false;
    window.clearTimeout(destroyTimer);
    // 延后一拍销毁：Sortable 收尾时会回写顺序，立即销毁可能吞掉这次排序结果
    destroyTimer = window.setTimeout(() => draggable.destroy(), 0);
  };

  const handlePointerDown = (event: Event) => {
    if (!isEnabled()) return;
    const handle = getHandle();
    const target = event.target;
    if (!handle || !(target instanceof Element) || !target.closest(handle)) return;
    const element = getElement();
    if (!element?.contains(target)) return;
    if (started) return;
    window.clearTimeout(destroyTimer);
    draggable.start(element);
    started = true;
  };

  onMounted(() => {
    // 捕获阶段先于 Sortable 自己的监听，先建实例再让本次手势命中它
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("pointerup", stopDraggable, true);
    document.addEventListener("pointercancel", stopDraggable, true);
  });
  onUnmounted(() => {
    document.removeEventListener("pointerdown", handlePointerDown, true);
    document.removeEventListener("pointerup", stopDraggable, true);
    document.removeEventListener("pointercancel", stopDraggable, true);
    stopDraggable();
  });
};
