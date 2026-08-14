/**
 * usePreviewData —— 简历预览层的数据代理
 *  收到一个对象 {
 *    user: {
 *      name: "张三",
 *      age: 30,
 *    },
 * }
 * 代理后
 * {
 *    user: {
 *      name: { value: "张三", newValue: "" },
 *      age: { value: 30, newValue: "" },
 *    },
 * }
 * 背景：
 *   currentData 是简历的真实数据，结构扁平（每个字段就是原值）。
 *   为了支持 AI 对每个字段的"修改建议 → 用户逐字段保留/放弃"，
 *   我们需要在不污染原始数据的前提下，为**每一个叶子字段**附加一个
 *   `{ value, newValue }` 的视图层包装；并提供批量操作能力。
 *
 * 本文件做的事：
 *   1. 用 Proxy 递归包装 currentData，访问任意路径的最终字段时
 *      返回一个"fieldProxy"对象（{ value, newValue }）。
 *   4. 暴露三个批量操作：acceptAll（全部保留写回原值）、
 *      rejectAll（一键清空所有草稿）、applyDiff（把 AI 返回的 JSON
 *      与原值做深度 diff，差异写入各字段 newValue）。
 *
 * 使用：
 *   const { previewData, acceptAll, rejectAll, applyDiff } = usePreviewData(currentData);
 *   // previewData.value.user.name  → fieldProxy { value, newValue }
 */
import { computed, type Ref } from "vue";

// 判断是否为普通对象（排除数组、Date 等）
const isPlainObject = (value: unknown) => {
  return Object.prototype.toString.call(value) === "[object Object]";
};

// 判断是否为"对象数组"（数组中至少包含一个普通对象），用于决定是否继续递归代理
const isObjectArray = (value: unknown) => {
  if (!Array.isArray(value)) return false;
  return value.some((item) => isPlainObject(item));
};

// 首字母大写：用于方案二遗留的字段名拼接（保留不删）
const upperFirst = (value: string) => {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
};

/**
 * 简化的 newValue 存储容器
 * 结构：普通对象，以字段路径（如 "user.name" 或 "education[0].school"）为键
 * - 不污染原始 source 的 ownProperty
 * - 路径字符串便于递归时直接存取
 */
const newValueStore: Record<string, any> = {};

// 生成字段路径
const makePath = (parent: string, key: string | number) => {
  return parent ? `${parent}.${key}` : String(key);
};

// 从 store 读取某路径的新值；不存在时返回空串与 UI 显示默认语义对齐
const getNewValue = (path: string): any => {
  return newValueStore[path] ?? "";
};

// 写入某路径的新值
const setNewValue = (path: string, value: any) => {
  if (value !== undefined && value !== null && value !== "") {
    newValueStore[path] = value;
  } else {
    // 空值视为删除草稿（与 reject 语义一致）
    delete newValueStore[path];
  }
};

// 一次性清除所有草稿新值
const clearAllNewValues = () => {
  Object.keys(newValueStore).forEach((k) => delete newValueStore[k]);
};

/**
 * 为单个叶子字段创建 fieldProxy 视图层包装
 * 对外暴露统一形状：{ value, newValue, __isFieldProxy, __source, __key }
 * - value：直接读写 source 上的真实字段（"保留"时写入这里）
 * - newValue：读写 store 里的 AI 草稿值（不碰原数据）
 */
const createFieldProxy = (source: Record<string, any>, key: string, path: string) => {
  return {
    get value() {
      return source[key];
    },
    set value(v: any) {
      source[key] = v;
    },
    get newValue() {
      return getNewValue(path);
    },
    set newValue(v: any) {
      setNewValue(path, v);
    },
    // 标识位：供 text.vue 自动识别 field 代理模式
    __isFieldProxy: true,
    __source: source,
    __key: key,
  };
};

/**
 * 递归创建 preview 代理（核心函数）
 * 规则：
 *   - 访问字段的值是对象数组 → 每一项继续 createPreviewProxy（返回 Proxy[]）
 *   - 访问字段的值是普通对象 → 继续 createPreviewProxy（返回子 Proxy）
 *   - 访问字段的值是叶子（string/number/array<string> 等）→ 返回 fieldProxy
 * 补齐的 Proxy trap：set / has / ownKeys / getOwnPropertyDescriptor
 *   保证 Object.keys、for...in、展开运算符、直接赋值等常见操作语义正确
 */
const createPreviewProxy = (source: Record<string, any>, parentPath = "") => {
  return new Proxy(source, {
    get(_, key) {
      if (typeof key !== "string") return undefined;
      // 暴露内部 source，便于外部操作句柄直接访问真实对象
      if (key === "__source") return source;

      const value = source[key];
      const currentPath = makePath(parentPath, key);

      // 对象数组：对子项递归代理
      if (isObjectArray(value)) {
        return value.map((item: Record<string, any>, idx: number) =>
          createPreviewProxy(item, makePath(currentPath, idx)),
        );
      }
      // 普通对象：递归代理
      if (isPlainObject(value)) {
        return createPreviewProxy(value, currentPath);
      }
      // 叶子值：包装为 fieldProxy { value, newValue }
      return createFieldProxy(source, key, currentPath);
    },
    set(_, key, value) {
      if (typeof key !== "string") return false;
      // 直接赋值 fieldProxy 风格对象 → 拆解分别写入 value / newValue
      if (value && typeof value === "object" && ("value" in value || "newValue" in value)) {
        if ("value" in value) source[key] = value.value;
        if ("newValue" in value) {
          const path = makePath(parentPath, key);
          setNewValue(path, value.newValue);
        }
        return true;
      }
      // 否则视为直接改原值
      source[key] = value;
      return true;
    },
    has(_, key) {
      if (typeof key !== "string") return false;
      return key in source;
    },
    ownKeys() {
      return Object.keys(source);
    },
    getOwnPropertyDescriptor(_, key) {
      if (typeof key !== "string") return undefined;
      if (!(key in source)) return undefined;
      return {
        configurable: true,
        enumerable: true,
        value: (this as any)[key],
      };
    },
  });
};

/**
 * 收集所有叶子字段的 [source, key, path] 元组
 * 供 acceptAll/rejectAll 内部使用
 */
const collectLeaves = (
  source: Record<string, any>,
  parentPath = "",
  list: Array<{ source: Record<string, any>; key: string; path: string }> = [],
) => {
  if (isObjectArray(source)) {
    (source as Record<string, any>[]).forEach((item, idx) =>
      collectLeaves(item, makePath(parentPath, idx), list),
    );
    return list;
  }
  if (isPlainObject(source)) {
    Object.keys(source).forEach((k) => {
      const v = (source as Record<string, any>)[k];
      const path = makePath(parentPath, k);
      if (isObjectArray(v) || isPlainObject(v)) {
        collectLeaves(v, path, list);
      } else {
        list.push({ source, key: k, path });
      }
    });
  }
  return list;
};

/**
 * usePreviewData 对外暴露的三个批量操作句柄类型
 */
export interface PreviewActions {
  acceptAll: () => void;
  rejectAll: () => void;
  applyDiff: (aiResult: Record<string, any>) => void;
}

/**
 * composable 入口
 * 入参：store 透出的 currentData Ref（可能是 undefined，未选中简历时）
 * 返回：{ previewData（computed 代理）, acceptAll, rejectAll, applyDiff }
 */
export const usePreviewData = (data: Ref<Record<string, any> | undefined>) => {
  // 代理后的预览数据：computed 包一层，currentData 切换时自动重建代理
  const previewData = computed(() => {
    const source = data.value || {};
    return createPreviewProxy(source);
  });

  // rejectAll：清空所有草稿（不碰原值）
  const rejectAll = () => {
    clearAllNewValues();
  };

  // acceptAll：把所有非空 newValue 写回原值，并清空草稿
  const acceptAll = () => {
    const source = data.value;
    if (!source) return;
    const leaves = collectLeaves(source);
    leaves.forEach(({ source: src, key, path }) => {
      const newVal = newValueStore[path];
      if (newVal !== undefined && newVal !== null && newVal !== "") {
        src[key] = newVal;
      }
    });
    // 全部写入后清空草稿
    clearAllNewValues();
  };

  /**
   * applyDiff：把 AI 返回 JSON（patch）与 source 做深度 diff
   *   - 数组：按下标逐对递归
   *   - 对象：按键逐对递归
   *   - 叶子：值不同则把 AI 值写入对应字段的 newValue
   */
  const applyDiff = (aiResult: Record<string, any>) => {
    const source = data.value;
    if (!source || !aiResult) return;

    const diffInner = (
      src: Record<string, any>,
      patch: Record<string, any>,
      parentPath: string,
    ) => {
      if (!patch || typeof patch !== "object") return;
      Object.keys(patch).forEach((key) => {
        // source 中不存在的字段直接跳过（保护未知键）
        if (!(key in src)) return;
        const srcVal = src[key];
        const patchVal = patch[key];
        const path = makePath(parentPath, key);

        // 数组 vs 数组：按索引逐项递归
        if (isObjectArray(srcVal) && isObjectArray(patchVal) && Array.isArray(srcVal)) {
          srcVal.forEach((item, idx) => {
            if (patchVal[idx]) diffInner(item, patchVal[idx], makePath(path, idx));
          });
          return;
        }
        // 对象 vs 对象：按键递归
        if (isPlainObject(srcVal) && isPlainObject(patchVal)) {
          diffInner(srcVal as Record<string, any>, patchVal as Record<string, any>, path);
          return;
        }
        // 叶子字段：与原值不同则写入 newValue（空字符串不写，与默认空值语义对齐）
        if (patchVal !== undefined && patchVal !== srcVal) {
          setNewValue(path, patchVal);
        }
      });
    };

    diffInner(source, aiResult, "");
  };

  return {
    previewData,
    acceptAll,
    rejectAll,
    applyDiff,
  };
};
