export type DataPath = Array<string | number>;

export interface DataPathContext {
  basePath: DataPath;
  index?: number;
}

// 将当前对象节点与可选的记录下标拼接为真实数据路径
export function resolveDataPath(source: string[], context?: DataPathContext): DataPath {
  if (!context) return [...source];
  return context.index === undefined
    ? [...context.basePath, ...source]
    : [...context.basePath, context.index, ...source];
}

// 进入子对象节点时保留父级上下文已解析出的真实路径
export function createDataPathContext(
  source: string[],
  parent?: DataPathContext,
): DataPathContext {
  return { basePath: resolveDataPath(source, parent) };
}
