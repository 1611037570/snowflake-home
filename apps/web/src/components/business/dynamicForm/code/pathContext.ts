export type DataPath = Array<string | number>;

export interface DataPathContext {
  basePath: DataPath;
  index: number;
}

// 将容器数据源、记录下标与字段相对路径合成为真实数据路径
export function resolveDataPath(source: string[], context?: DataPathContext): DataPath {
  if (!context) return [...source];
  return [...context.basePath, context.index, ...source];
}
