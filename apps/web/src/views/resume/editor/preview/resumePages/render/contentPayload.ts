import type { ParsedRichText } from "../engine/adapter/richTextParser";

/** 默认正文组件消费的字段；主题复用此协议，不自行假定载荷结构。 */
export interface ContentItem {
  name?: string; // 条目名称
  title?: string; // 学术成果标题
  department?: string; // 所属部门
  post?: string; // 职务或专业
  college?: string; // 教育经历学院名称
  education?: string; // 教育经历学历
  mode?: string; // 教育经历学制
  startTime?: string; // 经历开始时间
  endTime?: string; // 经历结束时间
  city?: string; // 条目所在地
  tags?: string[]; // 条目标签
  link?: string | { name?: string /* 链接名称 */, url?: string /* 链接地址 */ }; // 条目链接
  content?: string; // 原始正文
  url?: string; // 账号或作品地址
  desc?: string; // 媒体说明
  img?: string; // 图片地址
  size?: number; // 图片尺寸百分比
  date?: string; // 发表日期
  authors?: string; // 作者署名
  selfAuthor?: string; // 预览中强调的本人作者姓名，空值自动识别，清除标记表示不强调
  status?: string; // 成果状态
  venue?: string; // 发表载体
  doi?: string; // 论文链接
  indexTags?: string[]; // 索引标签
  level?: number; // 各技能样式共用的一到十分评分
  score?: string; // 教育经历成绩
}

export interface ContentPayload {
  item?: ContentItem; // 当前业务条目
  items?: ContentItem[]; // 同一行的技能条目
  columns?: number; // 技能条目的预览列数
  skillTemplate?: string; // 技能模板编号，取值 bar/dot/score/distribution/semiRing/donut/openRing
  content?: ParsedRichText; // 已解析正文
  inlineInfo?: string[]; // 适配器提供的并列信息
  html?: string; // 直接富文本载荷
  height?: number; // 公共间距高度
  text?: string; // 普通块文字
  value?: unknown; // 普通块原始显示值
}
