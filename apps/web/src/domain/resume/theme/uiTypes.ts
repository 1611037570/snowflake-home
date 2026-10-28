import type { LayoutColumns } from "@/domain/resume/theme/layouts";
import type { ResumeAvatarAppearance } from "@/domain/resume/theme/avatar";
import type { ResumeSchoolLogoAppearance } from "@/domain/resume/theme/schoolLogo";

// 页尾模板编号，新增模板时统一扩展此类型与模板登记。
export type FooterTemplateId = "total" | "number" | "page";

/** 简历界面配置；个人信息模板由主题预设提供，不开放用户切换。 */
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
    footer: string; // 页尾品牌文字，允许留空
    footerTemplate: FooterTemplateId; // 页尾内容模板编号
  };
  font: { // 字体、颜色与字号
    family: string; // 字体编号
    color: string; // 正文文字颜色，模板提供初始值且用户可从预设灰度中选择
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
    subtitleCenter: boolean; // 副标题是否居中展示
  };
  theme: { // 主题选择与展示参数
    color: string; // 主题色
    template: string; // 当前主题编号
    titleTemplate: string; // 标题样式编号，auto 表示使用主题默认标题样式
    skillTemplate: string; // 技能评分展示模板编号
    userTemplate: string; // 个人信息组件编号，auto 表示按页面版式使用公共组件
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
    avatar: ResumeAvatarAppearance; // 头像比例、形状、圆角与用户尺寸覆盖设置
    logo: ResumeSchoolLogoAppearance; // 校徽展示宽度与上传时确定的裁切比例
  };
  skill: { // 专业技能展示方式
    layout: string; // 正文或技能评分列表布局
    columns: number; // 技能评分列表列数
  };
  honor: { // 荣誉证书展示方式
    layout: "default" | "tag" | "notion" | "rainbowTag" | "list" | "card"; // 文本描述、标签、笔记风、彩虹标签、清单或详情卡片布局
  };
}

/** 对象字段允许部分声明，数组始终保存完整顺序。 */
export type UiOverrides<T> = {
  [K in keyof T]?: NonNullable<T[K]> extends LayoutColumns ? T[K] : T[K] extends (infer V)[]
    ? V[]
    : T[K] extends object | null ? UiOverrides<NonNullable<T[K]>> | Extract<T[K], null> : T[K];
};

/** 简历界面覆盖项；个人信息模板在展开与压缩时固定跟随主题。 */
export type ResumeUiOverrides = UiOverrides<ResumeUi>;

/** 主题预设不得自行覆盖其主题编号。 */
export type ThemeUiPreset = Omit<ResumeUiOverrides, "theme"> & {
  theme?: Omit<NonNullable<ResumeUiOverrides["theme"]>, "template">; // 主题色与组件样式默认值；标题图标与字号由默认标题样式提供
};
