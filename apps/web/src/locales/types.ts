export interface LangItem {
  // 最终要使用的语言
  key: string;
  // 语言显示名称
  name?: string;
  // 语言匹配值
  value: string;
}

export interface Translation {
  (key: string): string;
}
