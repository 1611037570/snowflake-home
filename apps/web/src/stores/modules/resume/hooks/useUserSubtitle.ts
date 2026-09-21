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

// 初始化校正：无内容字段取消置顶，顺序只保留有内容字段，并让分区按顺序排列
export function restoreUserSubtitleFields(runtimeConfig: any, data: any) {
  const keys = getUserSubtitleKeys(data?.user?.ui);
  if (!keys.length) return false;
  const moreBox = getUserContainer(runtimeConfig, "more");
  const subtitleBox = getUserContainer(runtimeConfig, "subtitle");
  if (!moreBox || !subtitleBox) return false;

  const kept: string[] = [];
  let moved = false;
  keys.forEach((key) => {
    const { box, field } = locateSubtitleField(moreBox, subtitleBox, key);
    if (!box || !field) return;

    // 无内容：字段回到更多分区，且不进入顺序
    if (!hasUserFieldContent(data, key)) {
      moved = moveFieldToContainer(box, moreBox, key) || moved;
      return;
    }
    if (box === moreBox) moved = moveFieldToContainer(moreBox, subtitleBox, key) || moved;
    kept.push(key);
  });

  const orderChanged = kept.length !== keys.length;
  if (orderChanged) setUserSubtitleOrder(data, kept);
  if (!moved && !orderChanged) return false;

  // 分区内字段按顺序数组排列，保证编辑区渲染顺序与预览一致
  const ordered = [...subtitleBox.fields].sort(
    (first: any, second: any) => kept.indexOf(first.key) - kept.indexOf(second.key),
  );
  subtitleBox.fields.splice(0, subtitleBox.fields.length, ...ordered);
  return true;
}
