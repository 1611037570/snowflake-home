/**
 * usePreviewData —— 简历预览层的纯数据代理
 *
 * 叶子字段统一包装为 { value }，模板只读 value；不再存在草稿/diff 概念，
 * AI 修改已直接写入真实简历数据。
 */
import { computed, type Ref } from "vue";

const isPlainObject = (value: unknown): boolean =>
  Object.prototype.toString.call(value) === "[object Object]";

const isObjectArray = (value: unknown): boolean =>
  Array.isArray(value) && value.some(isPlainObject);

const fieldProxyCache = new WeakMap<object, Record<string, any>>();

/**
 * 叶子字段代理：只暴露 value 读写，写操作直接落到源数据
 */
const getFieldProxy = (source: Record<string, any>, key: string): any => {
  let cache = fieldProxyCache.get(source);
  if (!cache) {
    cache = Object.create(null) as Record<string, any>;
    fieldProxyCache.set(source, cache);
  }
  if (!cache[key]) {
    cache[key] = {
      get value() {
        return source[key];
      },
      set value(v: any) {
        source[key] = v;
      },
    };
  }
  return cache[key];
};

const arrayShellCache = new WeakMap<object, Record<string, { shell: any[]; sourceArr: any[] }>>();

const isShellValid = (shell: any[], value: any[]): boolean => {
  if (shell.length !== value.length) return false;
  for (let i = 0; i < shell.length; i++) {
    if (shell[i] !== value[i] && shell[i]?.__source !== value[i]) return false;
  }
  return true;
};

const getArrayShell = (source: Record<string, any>, key: string, value: any[]): any[] => {
  let cache = arrayShellCache.get(source);
  if (!cache) {
    cache = Object.create(null) as Record<string, { shell: any[]; sourceArr: any[] }>;
    arrayShellCache.set(source, cache);
  }
  const hit = cache[key];
  if (hit && hit.sourceArr === value && isShellValid(hit.shell, value)) {
    return hit.shell;
  }
  const shell = value.map((item: Record<string, any>) => createPreviewProxy(item));
  cache[key] = { shell, sourceArr: value };
  return shell;
};

const proxyCache = new WeakMap<object, any>();

/**
 * 递归创建预览数据代理：普通对象/数组保留结构，叶子包装为 { value }
 */
export const createPreviewProxy = (source: Record<string, any>): any => {
  if (!isPlainObject(source) && !Array.isArray(source)) return source;
  if (proxyCache.has(source)) return proxyCache.get(source);

  const proxy = new Proxy(source, {
    get(target, key: string) {
      if (typeof key !== "string") return undefined;
      if (key === "__source") return target;
      if (!(key in target)) return undefined;
      const value = target[key];
      if (isObjectArray(value)) return getArrayShell(target, key, value);
      if (isPlainObject(value)) return createPreviewProxy(value);
      return getFieldProxy(target, key);
    },
    set(target, key: string, value: any) {
      if (typeof key !== "string") return false;
      if (value && typeof value === "object" && "value" in value) {
        target[key] = value.value;
        return true;
      }
      target[key] = value;
      return true;
    },
    has(target, key: string) {
      return key in target;
    },
    ownKeys(target) {
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(target, key: string) {
      if (!(key in target)) return undefined;
      return {
        configurable: true,
        enumerable: true,
        value: target[key],
      };
    },
  });

  proxyCache.set(source, proxy);
  return proxy;
};

export const usePreviewData = (data: Ref<Record<string, any> | undefined>) => {
  const previewData = computed(() => {
    const source = data.value || {};
    return createPreviewProxy(source);
  });

  return { previewData };
};
