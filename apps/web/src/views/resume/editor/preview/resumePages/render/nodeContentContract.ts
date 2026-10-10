import { computed } from "vue";
import type { LayoutNode } from "../engine/types";
import { sliceRichTextHtml } from "../engine/adapter/richTextParser";
import { isContentBlockVisible } from "../engine/contentBlocks";
import type { ContentPayload, ContentItem } from "./contentPayload";

/** 所有正文组件共享的输入，主题覆盖组件必须遵守同一分片协议。 */
export interface NodeContentProps {
  node: LayoutNode; // 原始排版节点
  payload?: unknown; // 当前分片载荷，未传时读取节点载荷
  dateRail?: boolean; // 日期是否放入条目左侧固定栏
  contentRange?: { start: number /* 起始字符 */, end: number /* 结束字符 */ }; // 正文字符区间
  blockRange?: { start: number /* 起始块 */, end: number /* 结束块 */ }; // 稳定内容块区间
  decoration?: "full" | "top" | "middle" | "bottom"; // 分片外观阶段
  showDebug?: boolean; // 是否展示间距调试标记
  leadingOnPage?: boolean; // 当前分片是否处于页面首位
}

/** 分片内容只在此处裁剪，主题组件复用结果而不再实现另一套分页。 */
export const useNodeContent = (props: NodeContentProps) => {
  // 在公共入口补齐空条目，覆盖组件无需重复判断载荷是否携带业务条目。
  const nodePayload = computed(() => {
    const payload = (props.payload ?? props.node.payload) as ContentPayload;
    return { ...payload, item: payload?.item ?? {} };
  });
  const item = computed<ContentItem>(() => nodePayload.value?.item || {});
  const richTextHtml = computed(() => {
    const parsed = nodePayload.value?.content ?? nodePayload.value;
    return parsed?.html ? sliceRichTextHtml(parsed.html, props.contentRange?.start || 0, props.contentRange?.end) : "";
  });
  const slicedItemDesc = computed(() => {
    const desc = String(item.value.desc || "");
    return props.contentRange ? desc.slice(props.contentRange.start, props.contentRange.end) : desc;
  });
  const isBlockVisible = (index: number) => isContentBlockVisible(index, props.blockRange);
  const hasContentBlock = computed(() => (props.blockRange?.end ?? Number.MAX_SAFE_INTEGER) > 0);
  const showItemHeader = computed(() => !props.contentRange || props.contentRange.start === 0);
  return {
    nodePayload, // 当前分片的实际载荷
    item, // 条目业务字段
    richTextHtml, // 按当前字符区间裁剪后的正文
    slicedItemDesc, // 按当前字符区间裁剪后的描述
    isBlockVisible, // 稳定块是否落在当前分片区间
    hasContentBlock, // 当前分片是否包含内容块
    showItemHeader, // 当前正文分片是否保留条目头部
  };
};

const safeUrlProtocols = new Set(["http:", "https:", "mailto:"]);

/** 链接内容与主题外观共用安全协议过滤，覆盖组件不得绕过此入口。 */
export const safeContentUrl = (value: unknown): string => {
  try {
    const url = new URL(String(value || "").trim());
    return safeUrlProtocols.has(url.protocol.toLowerCase()) ? url.href : "";
  } catch {
    return "";
  }
};
