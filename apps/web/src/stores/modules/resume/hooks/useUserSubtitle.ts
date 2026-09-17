// 副标题标记上限
export const MAX_USER_SUBTITLE = 3;

// 读取已标记的副标题字段：按标记序号升序，序号只用于排序，允许出现空洞
export function getUserSubtitleKeys(ui?: Record<string, any>): string[] {
  return Object.entries(ui ?? {})
    .filter(([, config]) => config?.subtitle > 0)
    .sort((first, second) => first[1].subtitle - second[1].subtitle)
    .map(([key]) => key);
}

// 下一个标记序号：取当前最大序号加一，取消标记不重排其余字段
export function getNextUserSubtitleOrder(ui?: Record<string, any>): number {
  const orders = Object.values(ui ?? {})
    .map((config: any) => config?.subtitle)
    .filter((order) => order > 0);
  return orders.length ? Math.max(...orders) + 1 : 1;
}
