export interface FontDefinition {
  key: string;
  family: string;
  load?: () => Promise<unknown>;
}

const fontDefinitions = new Map<string, FontDefinition>();
const fontPromises = new Map<string, Promise<void>>();

// 注册字体定义，动态字体只需要提供对应的样式加载函数
export const registerFont = (definition: FontDefinition) => {
  fontDefinitions.set(definition.key, definition);
};

export const registerFonts = (definitions: FontDefinition[]) => {
  definitions.forEach(registerFont);
};

// 按字体键加载样式并确认字体可用，同一字体复用同一个加载任务
export const loadFont = (key: string): Promise<void> => {
  const definition = fontDefinitions.get(key);
  if (!definition?.load || typeof document === "undefined") return Promise.resolve();

  const existingPromise = fontPromises.get(key);
  if (existingPromise) return existingPromise;

  const promise = definition
    .load()
    .then(() => document.fonts?.load(`16px "${definition.family}"`))
    .then(() => undefined)
    .catch((error) => {
      fontPromises.delete(key);
      throw error;
    });
  fontPromises.set(key, promise);
  return promise;
};
