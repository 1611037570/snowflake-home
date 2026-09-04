/**
 * useDiffFieldHover —— diff 悬浮事件委托
 *
 * 在预览容器上注册 mouseover/mouseout 委托监听，依据元素上的 data-field-key
 * 经 diffFieldRegistry 定位字段数据并触发浮层，替代每个 diffField 单独挂载
 * mouseenter/mouseleave，字段数量不再决定监听器数量。
 */
import { onBeforeUnmount, onMounted, type ComputedRef, type Ref } from "vue";
import { useDiffPopoverStore } from "@/stores/modules/diffPopover";
import { diffFieldRegistry } from "../components/diffField/diffFieldRegistry";

interface UseDiffFieldHoverOptions {
  /** 预览根容器（仅编辑态实例挂载，缩略图/只读不注册） */
  containerRef: Ref<HTMLElement | null>;
  isEdit: ComputedRef<boolean>;
  isPrinting: Ref<boolean>;
}

export const useDiffFieldHover = ({
  containerRef,
  isEdit,
  isPrinting,
}: UseDiffFieldHoverOptions) => {
  const popover = useDiffPopoverStore();

  // 从事件目标向上查找最近的已注册 diff 字段
  const findEntry = (target: EventTarget | null) => {
    let el = target instanceof Element ? target : null;
    while (el && el !== containerRef.value) {
      const key = (el as HTMLElement).dataset?.fieldKey;
      if (key && diffFieldRegistry.has(key)) return diffFieldRegistry.get(key)!;
      el = el.parentElement;
    }
    return null;
  };

  // 移入/穿过字段：有草稿则展示浮层；无草稿或已离开字段区域则隐藏
  const handleOver = (e: MouseEvent) => {
    if (!isEdit.value || isPrinting.value) return;
    const entry = findEntry(e.target);
    if (entry) {
      const v = entry.model();
      if (v == null) return;
      const newValue = v.newValue ?? "";
      // 无草稿字段不展示对比，进入时隐藏残留浮层
      if (newValue === "") {
        popover.hide();
        return;
      }
      // 每次进入都按当下鼠标重新锚定，含在字段内部子元素间移动的场景
      popover.show({
        field: v,
        value: v.value ?? "",
        newValue,
        html: entry.html,
        x: e.clientX,
        y: e.clientY,
      });
      return;
    }
    // 目标非字段：未进入其他字段（relatedTarget 非字段）才算真正移出
    if (!findEntry(e.relatedTarget)) popover.hide();
  };

  // 移出字段：relatedTarget 不在字段区域时隐藏
  const handleOut = (e: MouseEvent) => {
    if (!isEdit.value || isPrinting.value) return;
    if (findEntry(e.target) && !findEntry(e.relatedTarget)) popover.hide();
  };

  onMounted(() => {
    containerRef.value?.addEventListener("mouseover", handleOver);
    containerRef.value?.addEventListener("mouseout", handleOut);
  });
  onBeforeUnmount(() => {
    containerRef.value?.removeEventListener("mouseover", handleOver);
    containerRef.value?.removeEventListener("mouseout", handleOut);
  });
};
