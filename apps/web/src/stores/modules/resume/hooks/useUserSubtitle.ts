import { moveFieldToContainer } from "@/components/business/dynamicForm/api";

// 副标题标记上限
export const MAX_USER_SUBTITLE = 5;

// 读取副标题顺序：user.ui.subtitleOrder 是顺序的唯一来源
export function getUserSubtitleKeys(ui?: Record<string, any>): string[] {
  const order = ui?.subtitleOrder;
  return Array.isArray(order) ? order.filter((key: any) => typeof key === "string") : [];
}

// 写入副标题顺序：顺序变化只改这一个数组
export function setUserSubtitleOrder(data: any, keys: string[]) {
  const ui = data?.user?.ui;
  if (!ui) return;
  ui.subtitleOrder = [...keys];
}

// 字段值是否有内容：空字符串、空数组、空对象都视为无内容
export function isEmptyFieldValue(value: any): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.values(value).every(isEmptyFieldValue);
  return false;
}

// 个人信息字段是否有可展示内容：置顶校验、回收清理与分区渲染共用同一判据
export function hasUserFieldContent(data: any, key?: string): boolean {
  if (!key) return false;
  return !isEmptyFieldValue(data?.user?.data?.[key]);
}

// 在个人信息模块内按标识定位字段容器
function getUserContainer(runtimeConfig: any, key: string) {
  const userField = runtimeConfig?.fields?.find((field: any) => field?.key === "user");
  return userField?.fields?.find((field: any) => field?.key === key);
}

// 在副标题分区与更多分区中定位字段所在容器
function locateSubtitleField(moreBox: any, subtitleBox: any, key: string) {
  const inSubtitle = subtitleBox?.fields?.findIndex((field: any) => field?.key === key) ?? -1;
  if (inSubtitle >= 0) return { box: subtitleBox, field: subtitleBox.fields[inSubtitle] };
  const inMore = moreBox?.fields?.findIndex((field: any) => field?.key === key) ?? -1;
  if (inMore >= 0) return { box: moreBox, field: moreBox.fields[inMore] };
  return { box: undefined, field: undefined };
}

// 字段是否属于「更多」体系：只有这类字段支持置顶到姓名下方
export function isUserSubtitleCapable(runtimeConfig: any, key?: string): boolean {
  if (!key) return false;
  const moreBox = getUserContainer(runtimeConfig, "more");
  const subtitleBox = getUserContainer(runtimeConfig, "subtitle");
  return Boolean(locateSubtitleField(moreBox, subtitleBox, key).field);
}

// 标记为副标题：字段移入副标题分区，并追加到顺序末尾
export function markUserSubtitle(runtimeConfig: any, data: any, key?: string) {
  if (!key) return false;
  // 无内容的字段不参与置顶，避免分区里出现空行占位
  if (!hasUserFieldContent(data, key)) return false;
  const moreBox = getUserContainer(runtimeConfig, "more");
  const subtitleBox = getUserContainer(runtimeConfig, "subtitle");
  if (!moreBox || !subtitleBox) return false;
  if (!moveFieldToContainer(moreBox, subtitleBox, key)) return false;

  setUserSubtitleOrder(data, [...getUserSubtitleKeys(data?.user?.ui), key]);
  return true;
}

// 取消副标题：字段移回更多分区，并从顺序中移除
export function unmarkUserSubtitle(runtimeConfig: any, data: any, key?: string) {
  if (!key) return false;
  const moreBox = getUserContainer(runtimeConfig, "more");
  const subtitleBox = getUserContainer(runtimeConfig, "subtitle");
  if (!moreBox || !subtitleBox) return false;
  if (!moveFieldToContainer(subtitleBox, moreBox, key)) return false;

  setUserSubtitleOrder(
    data,
    getUserSubtitleKeys(data?.user?.ui).filter((item) => item !== key),
  );
  return true;
}

// 运行时分区由副标题顺序直接构建，配置持久化只保存编辑器字段顺序
export function applyUserSubtitleOrder(runtimeConfig: any, data: any) {
  const keys = getUserSubtitleKeys(data?.user?.ui);
  const moreBox = getUserContainer(runtimeConfig, "more");
  const subtitleBox = getUserContainer(runtimeConfig, "subtitle");
  if (!moreBox || !subtitleBox) return;

  const fields = [...subtitleBox.fields, ...moreBox.fields];
  const fieldsByKey = new Map(fields.map((field: any) => [field.key, field]));
  const subtitleFields = keys
    .map((key) => fieldsByKey.get(key))
    .filter((field): field is any => Boolean(field));
  const subtitleKeys = new Set(subtitleFields.map((field) => field.key));
  const moreFields = fields.filter((field: any) => !subtitleKeys.has(field.key));

  subtitleBox.fields.splice(0, subtitleBox.fields.length, ...subtitleFields);
  moreBox.fields.splice(0, moreBox.fields.length, ...moreFields);
}
