<script>
import { Comment, Text } from "vue";

/** 过滤占位节点（v-if 的注释、块间空白），保证块序与真实 DOM 的元素顺序一一对应 */
const isBlockVNode = (vnode) => vnode && vnode.type !== Comment && vnode.type !== Text;

/**
 * 按块序过滤子块：只渲染 [start, end) 区间内的块。
 * 块的划分完全由渲染结构决定，不依赖任何模块/字段定义；
 * 区间的来源是测量层从真实 DOM 读到的块边界。
 */
export default {
  name: "LayoutBlockRange",
  props: {
    start: {
      type: Number,
      default: 0,
    },
    end: {
      type: Number,
      default: Number.MAX_SAFE_INTEGER,
    },
  },
  setup(props, { slots }) {
    return () =>
      (slots.default?.() ?? [])
        .filter(isBlockVNode)
        .slice(props.start, props.end);
  },
};
</script>
