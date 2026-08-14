import { computed, type Ref } from "vue";

const upperFirst = (value: string) => {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
};

const isPlainObject = (value: unknown) => {
  return Object.prototype.toString.call(value) === "[object Object]";
};

const isObjectArray = (value: unknown) => {
  if (!Array.isArray(value)) return false;
  return value.some((item) => isPlainObject(item));
};

const createFieldProxy = (target: Record<string, any>, key: string) => {
  const newKey = `new${upperFirst(key)}`;

  return {
    get value() {
      return target[key];
    },
    set value(value) {
      target[key] = value;
    },
    get newValue() {
      return target[newKey] || "";
    },
    set newValue(value) {
      target[newKey] = value;
    },
  };
};

const createPreviewProxy = (source: Record<string, any>) => {
  return new Proxy(
    {},
    {
      get(_, key) {
        if (typeof key !== "string") return undefined;

        const value = source[key];

        if (isObjectArray(value)) {
          return value.map((item: Record<string, any>) => createPreviewProxy(item));
        }

        if (isPlainObject(value)) {
          return createPreviewProxy(value);
        }

        return createFieldProxy(source, key);
      },
    },
  );
};

export const usePreviewData = (data: Ref<Record<string, any> | undefined>) => {
  return computed(() => {
    return createPreviewProxy(data.value || {});
  });
};
