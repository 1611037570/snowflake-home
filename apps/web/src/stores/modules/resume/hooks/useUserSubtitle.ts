// 副标题标记上限
export const MAX_USER_SUBTITLE = 3;

// 读取已标记的副标题字段：按标记序号升序，序号只用于排序，允许出现空洞
export function getUserSubtitleKeys(ui?: Record<string, any>): string[] {
  return Object.entries(ui ?? {})
    .filter(([, config]) => config?.subtitle > 0)
    .sort((first, second) => first[1].subtitle - second[1].subtitle)
    .map(([key]) => key);
}

// 在个人信息模块内按标识定位字段容器
function getUserContainer(runtimeConfig: any, key: string) {
  const userField = runtimeConfig?.fields?.find((field: any) => field?.key === "user");
  return userField?.fields?.find((field: any) => field?.key === key);
}

// 按副标题分区内的字段顺序回写序号：预览按序号在姓名下方依次展示
export function syncUserSubtitleOrder(data: any, keys: string[]) {
  const ui = data?.user?.ui;
  if (!ui) return;
  keys.forEach((key, index) => {
    ui[key] ??= {};
    ui[key].subtitle = index + 1;
  });
}

// 标记为副标题：字段配置从更多分区移入副标题分区，序号按分区顺序重排
export function markUserSubtitle(runtimeConfig: any, data: any, key?: string) {
  if (!key) return false;
  const moreBox = getUserContainer(runtimeConfig, "more");
  const subtitleBox = getUserContainer(runtimeConfig, "subtitle");
  if (!moreBox || !subtitleBox) return false;

  const index = moreBox.fields?.findIndex((field: any) => field?.key === key) ?? -1;
  if (index < 0) return false;

  const [field] = moreBox.fields.splice(index, 1);
  subtitleBox.fields.push(field);
  syncUserSubtitleOrder(
    data,
    subtitleBox.fields.map((item: any) => item.key),
  );
  return true;
}

// 取消副标题：字段配置移回更多分区末尾，序号按剩余分区顺序重排
export function unmarkUserSubtitle(runtimeConfig: any, data: any, key?: string) {
  if (!key) return false;
  const moreBox = getUserContainer(runtimeConfig, "more");
  const subtitleBox = getUserContainer(runtimeConfig, "subtitle");
  if (!moreBox || !subtitleBox) return false;

  const index = subtitleBox.fields?.findIndex((field: any) => field?.key === key) ?? -1;
  if (index < 0) return false;

  const [field] = subtitleBox.fields.splice(index, 1);
  moreBox.fields.push(field);
  if (data?.user?.ui?.[key]) data.user.ui[key].subtitle = 0;
  syncUserSubtitleOrder(
    data,
    subtitleBox.fields.map((item: any) => item.key),
  );
  return true;
}

// 迁移历史数据：把已标记但仍留在更多分区里的字段搬入副标题分区，并按序号排列
export function restoreUserSubtitleFields(runtimeConfig: any, data: any) {
  const keys = getUserSubtitleKeys(data?.user?.ui);
  if (!keys.length) return false;
  const moreBox = getUserContainer(runtimeConfig, "more");
  const subtitleBox = getUserContainer(runtimeConfig, "subtitle");
  if (!moreBox || !subtitleBox) return false;

  let changed = false;
  keys.forEach((key) => {
    const index = moreBox.fields?.findIndex((field: any) => field?.key === key) ?? -1;
    if (index < 0) return;
    const [field] = moreBox.fields.splice(index, 1);
    subtitleBox.fields.push(field);
    changed = true;
  });
  if (!changed) return false;

  const ordered = [...subtitleBox.fields].sort(
    (first: any, second: any) => keys.indexOf(first.key) - keys.indexOf(second.key),
  );
  subtitleBox.fields.splice(0, subtitleBox.fields.length, ...ordered);
  syncUserSubtitleOrder(data, keys);
  return true;
}
