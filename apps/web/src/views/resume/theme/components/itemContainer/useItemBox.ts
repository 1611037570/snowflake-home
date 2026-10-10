import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { getItemFragmentStyle } from "@/views/resume/editor/preview/resumePages/render/itemStyle";

/** 条目分片与盒模型入参：由条目外观组件原样透传父级下发的分片信息 */
export interface ItemBoxProps {
  /** 分片覆盖的块区间：续段不画上圆角、不补上内边距 */
  blockRange: { start: number; end: number };
  /** 分片覆盖的正文区间 */
  contentRange?: { start: number; end: number };
  /** 分片装饰类型 */
  decoration: "full" | "top" | "middle" | "bottom";
  /** 是否使用左侧时间轴日期栏 */
  timeline: boolean;
}

/** 条目盒模型声明：留白与圆角由外观组件自己给出 */
export interface ItemBoxOptions {
  /** 条目圆角，分片内外侧由共享规则裁剪 */
  radius: string;
  /** 非时间轴时的左内边距 */
  paddingLeft?: string;
  /** 条目四周内边距，缺省为 0 */
  padding?: string;
  /** 条目底色 */
  backgroundColor?: MaybeRefOrGetter<string>;
  /** 条目描边色 */
  borderColor?: MaybeRefOrGetter<string>;
  /** 无日期条目仍预留对齐空间，不决定日期是否显示 */
  reserveDateRail?: boolean;
}

/**
 * 条目盒模型：分片圆角、续段收边与时间轴日期栏由同一处计算。
 * 渲染与测量共用同一份结果，避免两侧各自实现导致分页高度不一致。
 * @param props 条目分片入参
 * @param options 外观自己声明的留白与配色
 */
export const useItemBox = (props: ItemBoxProps, options: ItemBoxOptions) => {
  const {
    radius,
    paddingLeft = "0px",
    padding = "0px",
    backgroundColor = "transparent",
    borderColor = "transparent",
  } = options;
  // 日期显示只由公共能力决定，外观可为无日期条目保留同宽对齐空间。
  const usesDateRail = computed(() => props.timeline || options.reserveDateRail === true);
  const fragmentStyle = computed(() =>
    getItemFragmentStyle(props.blockRange, props.contentRange, props.decoration, radius),
  );
  const boxStyle = computed(() => ({
    paddingTop: padding,
    paddingRight: padding,
    paddingBottom: padding,
    paddingLeft: usesDateRail.value ? "var(--timeline-rail-width)" : paddingLeft,
    backgroundColor: toValue(backgroundColor),
  }));
  // 分片片段的边框边缘跟随外壳分片规则收起
  const borderStyle = computed(() => ({
    borderColor: toValue(borderColor),
    borderRadius: "inherit",
    borderTopWidth: fragmentStyle.value.borderTopWidth,
    borderBottomWidth: fragmentStyle.value.borderBottomWidth,
  }));

  return { usesDateRail, fragmentStyle, boxStyle, borderStyle };
};
