/**
 * 简历媒体字段表：base64 大字段的唯一声明处
 * 历史快照、AI 上下文、文本统计等需要跳过或单独承载媒体的逻辑，统一读这里的声明，
 * 避免同类规则散落在各处导致新增图片类字段后漏改。
 */

// 媒体字段声明
type MediaFieldDecl = {
  /** 数据节点标识：数组模块直接写模块 key，对象模块在 key 后再补一层 data */
  moduleKey: string;
  /** 模块数据形态：数组模块媒体在 list 的每条记录内，对象模块媒体在 data 内 */
  shape: "array" | "object";
  /** 承载 base64 的字段名 */
  field: string;
};

const MEDIA_FIELD_DECLS: MediaFieldDecl[] = [
  // 个人信息头像：base64 Data URL，存于 user.data
  { moduleKey: "user", shape: "object", field: "avatar" },
  // 图片作品图片：base64 Data URL，存于 image.list[].data
  { moduleKey: "image", shape: "array", field: "img" },
];

// 单个媒体绑定：记录字段标识与所在数据对象的绝对路径
type MediaBinding = {
  /** 承载 base64 的字段名 */
  field: string;
  /** 该字段所属数据对象的绝对路径，不含字段本身；末段为记录下标 */
  path: (string | number)[];
};

// 媒体在撤销栈中的占位格式：快照只保留该标识，base64 由媒体池按同一标识另行保存
const MEDIA_MARK_PREFIX = "@media:";

// 把媒体内容摘要成短标识：同一字段更换图片后占位随之改变，媒体池据此区分不同版本
const hashMediaContent = (value: string): string => {
  let high = 0x811c;
  let low = 0x9dc5;
  for (let index = 0; index < value.length; index += 1) {
    const charCode = value.charCodeAt(index);
    high = (high ^ charCode) * 0x0100 >>> 0;
    low = (low ^ charCode) * 0x0100 >>> 0;
  }
  return (high >>> 0).toString(16) + (low >>> 0).toString(16);
};

// 构造媒体占位标识：路径定界字段位置，内容摘要区分同一字段的不同版本
export const mediaMark = (field: string, path: (string | number)[], value: string) =>
  `${MEDIA_MARK_PREFIX}${field}:${path.join(".")}:${hashMediaContent(value)}`;

// 媒体占位标识是否是本表声明过的字段，避免把普通文本误当媒体处理
export const isMediaMark = (value: unknown): value is string =>
  typeof value === "string" &&
  MEDIA_FIELD_DECLS.some((decl) => value.startsWith(`${MEDIA_MARK_PREFIX}${decl.field}:`));

// 逐个媒体绑定求值，回调返回 false 时提前结束
const scanMediaBindings = (
  data: any,
  visit: (binding: MediaBinding, held: any) => boolean | void,
): void => {
  for (const decl of MEDIA_FIELD_DECLS) {
    const module = data?.[decl.moduleKey];
    if (!module || typeof module !== "object") continue;

    if (decl.shape === "object") {
      const held = module.data;
      if (!held || typeof held !== "object") continue;
      if (visit({ field: decl.field, path: [decl.moduleKey, "data"] }, held) === false) return;
      continue;
    }

    if (!Array.isArray(module.list)) continue;
    for (let index = 0; index < module.list.length; index += 1) {
      const held = module.list[index]?.data;
      if (!held || typeof held !== "object") continue;
      if (visit({ field: decl.field, path: [decl.moduleKey, "list", index, "data"] }, held) === false) {
        return;
      }
    }
  }
};

/** 按路径逐级取值，任一层缺失返回 undefined */
export const getValueAtPath = (data: any, path: (string | number)[]): any => {
  let current = data;
  for (const key of path) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[key];
  }
  return current;
};

/** 按路径写入值，中间层缺失时补齐对象或数组 */
export const setValueAtPath = (data: any, path: (string | number)[], value: any): void => {
  if (!path.length) return;
  let current = data;
  for (let index = 0; index < path.length - 1; index += 1) {
    const key = path[index];
    if (key === undefined) return;
    if (current[key] == null || typeof current[key] !== "object") {
      current[key] = typeof path[index + 1] === "number" ? [] : {};
    }
    current = current[key];
  }
  const lastKey = path[path.length - 1];
  if (lastKey === undefined) return;
  current[lastKey] = value;
};

/**
 * 收集数据中的媒体绑定
 * 空值媒体默认仍然收集：历史快照需要记住“这里当时没有媒体”，否则撤销删除媒体时会把它贴回来。
 * 仅需剔除媒体的场景（如 AI 请求体）可传 skipWhenEmpty 跳过空值。
 */
export const collectMediaBindings = (
  data: any,
  options: { skipWhenEmpty?: boolean } = {},
): MediaBinding[] => {
  const bindings: MediaBinding[] = [];
  scanMediaBindings(data, (binding, held) => {
    if (options.skipWhenEmpty && !held[binding.field]) return;
    bindings.push(binding);
  });
  return bindings;
};

/** 就地移除数据中的媒体字段，用于 AI 请求体等只需剔除媒体的场景 */
export const omitMediaFromData = (data: any): any => {
  scanMediaBindings(data, (binding, held) => {
    delete held[binding.field];
  });
  return data;
};
