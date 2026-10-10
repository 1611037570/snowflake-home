import type { LayoutColumns } from "./layouts";

/** 用户可编辑的简历界面配置，主题固定外观不得进入此结构。 */
export interface ResumeUi {
  page: { // 页面颜色与留白
    background: string; // 纸张背景色
    padding: { // 页面边距，单位像素
      vertical: number; // 上下边距
      horizontal: number; // 左右边距
    };
    spacing: { // 内容间距，单位像素
      paragraph: number; // 段落间距
      module: number; // 模块间距
    };
    footer: string; // 自定义页尾文字
  };
  font: { // 字体与字号
    family: string; // 字体编号
    size: number; // 正文字号
    titleSize: number; // 模块标题字号
    lineHeight: number; // 行高倍数
  };
  content: { // 正文展示方式
    language: string; // 简历展示语言
    textAlign: string; // 正文对齐方式
    infoSeparator: string; // 并列信息分隔方式
    linkUnderline: boolean; // 链接是否显示下划线
    dateStyle: string; // 日期展示格式
    datePosition: string; // 条目日期位置
  };
  theme: { // 用户可调主题参数
    color: string; // 主题色
    template: string; // 当前主题编号
    titleIconMode: string; // 模块标题图标模式
  };
  layout: { // 用户可调栏位参数
    columns: LayoutColumns | null; // 左右栏模块顺序，空值使用版式默认顺序
    leftColumnWidth: number; // 左栏宽度百分比
  };
  user: { // 个人信息展示方式
    infoMode: string; // 资料标签展示模式
    infoLayout: string; // 资料排列方式
    avatarPosition: string; // 头像位置
    infoPosition: string; // 资料水平对齐位置
  };
}

/** 对象字段允许部分声明，数组始终保存完整顺序。 */
export type UiOverrides<T> = {
  [K in keyof T]?: NonNullable<T[K]> extends LayoutColumns ? T[K] : T[K] extends (infer V)[]
    ? V[]
    : T[K] extends object | null ? UiOverrides<NonNullable<T[K]>> | Extract<T[K], null> : T[K];
};

/** 只包含用户可编辑字段的覆盖项。 */
export type ResumeUiOverrides = UiOverrides<ResumeUi>;

/** 主题预设不得自行覆盖其主题编号。 */
export type ThemeUiPreset = Omit<ResumeUiOverrides, "theme"> & {
  theme?: Omit<NonNullable<ResumeUiOverrides["theme"]>, "template">; // 主题色与标题图标默认值
};
