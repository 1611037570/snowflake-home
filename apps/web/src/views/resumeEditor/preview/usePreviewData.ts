/**
 * usePreviewData —— 简历预览层的数据代理
 *
 * 收到一个对象，例如：
 * {
 *   user: { name: "张三", age: 30 },
 *   like: { a: { name: "a", age: 18 } },
 *   experiences: [ { company: "腾讯", years: 3 } ],
 *   tags: ["前端", "Vue"]
 * }
 *
 * 代理后（逻辑视图）：
 * {
 *   user: {                      // ✅ 中间对象保持原样
 *     name: { value: "张三", newValue: "" },   // ✅ 叶子字段变为双字段
 *     age: { value: 30, newValue: "" }
 *   },
 *   like: {                      // ✅ 中间对象保持原样
 *     a: {                       // ✅ 中间对象保持原样
 *       name: { value: "a", newValue: "" },
 *       age: { value: 18, newValue: "" }
 *     }
 *   },
 *   experiences: [               // ✅ 中间数组保持原样
 *     {                          // ✅ 数组中的对象（中间节点）保持原样
 *       company: { value: "腾讯", newValue: "" },
 *       years: { value: 3, newValue: "" }
 *     }
 *   ],
 *   tags: { value: ["前端", "Vue"], newValue: "" }  // ✅ 原始值数组作为整体叶子
 * }
 *
 * 额外约定：用户通过 value setter 修改原值时，若新值与旧值不同，则自动清空该字段的 newValue（草稿）。
 **/
import { computed, reactive, watch, type Ref } from "vue";

// ---------- 工具函数 ----------

/**
 * 判断一个值是否为普通对象（非数组、非 Date 等）
 * @param value - 待判断的值
 * @returns 是否为普通对象
 */
const isPlainObject = (value: unknown): boolean =>
  Object.prototype.toString.call(value) === "[object Object]";

/**
 * 判断一个值是否为“对象数组”（数组中至少包含一个普通对象）
 * 用于决定是否需要对数组元素进行递归代理
 * @param value - 待判断的值
 * @returns 是否为对象数组
 */
const isObjectArray = (value: unknown): boolean =>
  Array.isArray(value) && value.some(isPlainObject);

/**
 * 生成字段路径字符串，用点号连接父路径和键名
 * @param parent - 父路径，如 "user"
 * @param key - 当前键，如 "name" 或数字索引
 * @returns 完整路径，如 "user.name" 或 "education.0.school"
 */
const makePath = (parent: string, key: string | number): string =>
  parent ? `${parent}.${key}` : String(key);

// 数组按元素比较，避免相同内容的不同数组引用被判定为变化
const areValuesEqual = (left: any, right: any): boolean => {
  if (left === right) return true;
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
  return left.every((item, index) => areValuesEqual(item, right[index]));
};

// ---------- 响应式草稿存储 ----------

/**
 * 全局存储所有叶子字段的 AI 草稿值（newValue）
 * 键为字段路径（如 "user.name"），值为 AI 推荐的字符串或任意值
 * 使用 reactive 确保视图响应式更新
 */
const newValueStore = reactive<Record<string, any>>({});

/**
 * 读取某路径的草稿值
 * @param path - 字段路径
 * @returns 草稿值，若不存在则返回空字符串
 */
const getNewValue = (path: string): any => newValueStore[path] ?? "";

/**
 * 写入某路径的草稿值
 * - 若 value 有效（非 null/undefined/空字符串），则存储
 * - 否则删除该路径的草稿（视为清空）
 * @param path - 字段路径
 * @param value - 要写入的值
 */
const setNewValue = (path: string, value: any): void => {
  if (value != null && value !== "") {
    newValueStore[path] = value;
  } else {
    delete newValueStore[path];
  }
};

/**
 * 清空所有草稿值
 */
const clearAllNewValues = (): void => {
  Object.keys(newValueStore).forEach((k) => delete newValueStore[k]);
};

// 清空指定模块的 AI 草稿
const clearModuleNewValues = (moduleKey: string): void => {
  const prefix = `${moduleKey}.`;
  Object.keys(newValueStore).forEach((path) => {
    if (path === moduleKey || path.startsWith(prefix)) delete newValueStore[path];
  });
};

// ---------- 字段代理工厂（叶子节点） ----------

/**
 * 为单个叶子字段创建代理对象，暴露 { value, newValue } 双字段
 * - value：读写原始数据源（source[key]）
 * - newValue：读写独立存储的草稿（通过路径操作 store）
 * 若通过 value setter 修改原值，且值发生变化，则自动清空该字段的草稿
 * @param source - 原始数据对象
 * @param key - 字段名
 * @param path - 字段完整路径
 * @returns 包含 value 和 newValue 的 getter/setter 对象
 */
const createFieldProxy = (source: Record<string, any>, key: string, path: string) => ({
  get value() {
    return source[key];
  },
  set value(v: any) {
    // 只有值真正变化时才更新，并清空草稿
    if (v !== source[key]) {
      source[key] = v;
      setNewValue(path, ""); // 清空该字段的 AI 建议
    }
  },
  get newValue() {
    return getNewValue(path);
  },
  set newValue(v: any) {
    setNewValue(path, v);
  },
});

// ---------- 递归代理创建（带缓存） ----------

/**
 * 缓存已创建的 Proxy，避免重复构造相同对象
 * 键为原始对象引用，值为对应的 Proxy
 */
const proxyCache = new WeakMap<object, any>();

/**
 * 递归创建预览数据的 Proxy 代理
 * - 对于普通对象/数组，递归代理其属性/元素
 * - 对于叶子值（基本类型、字符串数组等），包装为 { value, newValue }
 * - 不存在的属性返回 undefined，不进行任何代理
 * 导出供数据源与父级不同的预览实例（缩略图/全屏）复用，同一份数据仍由顶层统一代理
 * @param source - 要代理的原始对象（或数组）
 * @param parentPath - 当前父路径（用于生成字段路径）
 * @returns 代理后的对象
 */
export const createPreviewProxy = (source: Record<string, any>, parentPath = ""): any => {
  // 非对象/数组直接返回原值（实际不会走到这里）
  if (!isPlainObject(source) && !Array.isArray(source)) return source;

  // 检查缓存
  if (proxyCache.has(source)) {
    return proxyCache.get(source);
  }

  const proxy = new Proxy(source, {
    /**
     * 拦截属性读取
     */
    get(target, key: string) {
      if (typeof key !== "string") return undefined;
      // 调试通道：暴露原始对象
      if (key === "__source") return target;
      // 不存在的属性不处理
      if (!(key in target)) return undefined;

      const value = target[key];
      const currentPath = makePath(parentPath, key);

      // 若是对象数组，递归代理每个元素
      if (isObjectArray(value)) {
        return value.map((item: Record<string, any>, idx: string | number) =>
          createPreviewProxy(item, makePath(currentPath, idx)),
        );
      }
      // 若是普通对象，递归代理该对象
      if (isPlainObject(value)) {
        return createPreviewProxy(value, currentPath);
      }
      // 叶子值：包装为 fieldProxy
      return createFieldProxy(target, key, currentPath);
    },

    /**
     * 拦截属性赋值
     * - 如果赋的值是 fieldProxy 风格对象，则拆解分别设置 value / newValue
     * - 否则直接赋值给原对象
     */
    set(target, key: string, value: any) {
      if (typeof key !== "string") return false;
      // 若赋值的是 { value, newValue } 风格对象
      if (value && typeof value === "object" && ("value" in value || "newValue" in value)) {
        if ("value" in value) target[key] = value.value;
        if ("newValue" in value) {
          setNewValue(makePath(parentPath, key), value.newValue);
        }
        return true;
      }
      target[key] = value;
      return true;
    },

    /**
     * 拦截 in 操作符，保持一致性
     */
    has(target, key: string) {
      return key in target;
    },

    /**
     * 拦截 Object.keys 等操作，返回原始键列表
     */
    ownKeys(target) {
      return Reflect.ownKeys(target);
    },

    /**
     * 拦截属性描述符，保持枚举性和可配置性
     * 直接返回原始值，避免触发 get 陷阱
     */
    getOwnPropertyDescriptor(target, key: string) {
      if (!(key in target)) return undefined;
      return {
        configurable: true,
        enumerable: true,
        value: target[key],
      };
    },
  });

  // 缓存并返回
  proxyCache.set(source, proxy);
  return proxy;
};

// ---------- 叶子收集（用于 acceptAll） ----------

/**
 * 递归收集所有叶子字段的 { source, key, path } 信息
 * 用于在 acceptAll 中遍历所有可接受草稿的字段
 * @param source - 当前处理的对象或数组
 * @param parentPath - 父路径
 * @param list - 收集结果数组
 * @returns 收集结果列表
 */
const collectLeaves = (
  source: any,
  parentPath = "",
  list: Array<{ source: Record<string, any>; key: string; path: string }> = [],
): Array<{ source: Record<string, any>; key: string; path: string }> => {
  if (isObjectArray(source)) {
    // 数组：递归每个元素
    source.forEach((item: Record<string, any>, idx: string | number) =>
      collectLeaves(item, makePath(parentPath, idx), list),
    );
  } else if (isPlainObject(source)) {
    // 对象：遍历所有自有属性
    Object.keys(source).forEach((k) => {
      const v = source[k];
      const path = makePath(parentPath, k);
      if (isObjectArray(v) || isPlainObject(v)) {
        // 中间节点继续递归
        collectLeaves(v, path, list);
      } else {
        // 叶子节点：收集
        list.push({ source, key: k, path });
      }
    });
  }
  return list;
};

// ---------- Composable 入口 ----------

/**
 * usePreviewData 提供的操作接口
 */
export interface PreviewActions {
  acceptAll: () => void; // 接受所有草稿，写入原值
  rejectAll: () => void; // 拒绝所有草稿，清空
  acceptModule: (moduleKey: string) => void; // 接受指定模块草稿
  rejectModule: (moduleKey: string) => void; // 拒绝指定模块草稿
  applyDiff: (aiResult: Record<string, any>) => string[]; // 应用 AI 差异，返回写入草稿的字段路径
}

/**
 * 主要 Composable，接收简历数据 Ref，返回预览代理和操作函数
 * @param data - 包含简历数据的 Ref，可以是 undefined（未选中）
 * @returns 预览数据代理和三个批量操作方法
 */
export const usePreviewData = (data: Ref<Record<string, any> | undefined>) => {
  // 切换简历时自动清空所有草稿，避免数据污染
  watch(data, clearAllNewValues);

  // 计算属性：每次 data 变化时重新创建代理
  const previewData = computed(() => {
    const source = data.value || {};
    return createPreviewProxy(source);
  });

  // 拒绝所有：清空草稿
  const rejectAll = clearAllNewValues;

  // 接受所有：将所有非空草稿写入原值，然后清空草稿
  const acceptAll = (): void => {
    const source = data.value;
    if (!source) return;
    const leaves = collectLeaves(source);
    leaves.forEach(({ source: src, key, path }) => {
      const newVal = newValueStore[path];
      if (newVal != null && newVal !== "") {
        src[key] = newVal;
      }
    });
    clearAllNewValues();
  };

  // 接受指定模块：写入该模块的草稿并清空对应草稿
  const acceptModule = (moduleKey: string): void => {
    const source = data.value;
    if (!source || !moduleKey || !(moduleKey in source)) return;

    const module = source[moduleKey];
    if (module && typeof module === "object") {
      const leaves = collectLeaves(module, moduleKey);
      leaves.forEach(({ source: src, key, path }) => {
        const newVal = newValueStore[path];
        if (newVal != null && newVal !== "") src[key] = newVal;
      });
    } else {
      const newVal = newValueStore[moduleKey];
      if (newVal != null && newVal !== "") source[moduleKey] = newVal;
    }
    clearModuleNewValues(moduleKey);
  };

  // 拒绝指定模块：清空该模块的所有草稿
  const rejectModule = (moduleKey: string): void => {
    if (moduleKey) clearModuleNewValues(moduleKey);
  };

  /**
   * 应用 AI 返回的差异补丁（patch）
   * - 先清空所有旧草稿
   * - 递归对比 patch 与 source，若叶子值不同则写入草稿
   * @param aiResult - AI 返回的完整数据对象（只包含需要更新的字段）
   */
  const applyDiff = (aiResult: Record<string, any>): string[] => {
    const source = data.value;
    if (!source || !aiResult) return [];

    // 清空旧草稿，保证完全替换
    clearAllNewValues();

    // 记录本次写入草稿的字段路径，便于调试确认 diff 是否生效
    const changedPaths: string[] = [];

    /**
     * 内部递归 diff 函数
     * @param src - 当前对比的源对象
     * @param patch - 当前对比的补丁对象
     * @param parentPath - 当前父路径
     */
    const diffInner = (
      src: Record<string, any>,
      patch: Record<string, any>,
      parentPath: string,
    ): void => {
      if (!patch || typeof patch !== "object") return;
      Object.keys(patch).forEach((key) => {
        if (!(key in src)) return; // 忽略源中不存在的字段
        const srcVal = src[key];
        const patchVal = patch[key];
        const path = makePath(parentPath, key);

        // 若两者都是对象数组，按索引递归比较
        if (isObjectArray(srcVal) && isObjectArray(patchVal)) {
          srcVal.forEach((item: Record<string, any>, idx: string | number) => {
            if (patchVal[idx]) {
              diffInner(item, patchVal[idx], makePath(path, idx));
            }
          });
          return;
        }
        // 若两者都是普通对象，按键递归比较
        if (isPlainObject(srcVal) && isPlainObject(patchVal)) {
          diffInner(srcVal, patchVal, path);
          return;
        }
        // 叶子字段：若 patch 值与当前值不同，则写入草稿
        if (patchVal !== undefined && !areValuesEqual(patchVal, srcVal)) {
          setNewValue(path, patchVal);
          changedPaths.push(path);
        }
      });
    };

    diffInner(source, aiResult, "");
    return changedPaths;
  };

  return {
    previewData, // 代理后的预览数据，可直接在模板中绑定
    acceptAll,
    rejectAll,
    acceptModule,
    rejectModule,
    applyDiff,
  };
};
