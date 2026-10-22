// 简历字段写入操作，由宿主负责把语义化操作落到真实简历数据。
export type ResumeWriteOp =
  | {
      // 操作类型：修改对象型模块的字段。
      op: "updateModule";
      // 目标模块的稳定标识。
      module: string;
      // 目标字段名称。
      field: string;
      // 要写入的字段值。
      value: unknown;
    }
  | {
      // 操作类型：修改模块展示标题。
      op: "updateModuleTitle";
      // 目标模块的稳定标识。
      module: string;
      // 要写入的模块标题。
      title: string;
    }
  | {
      // 操作类型：修改数组型模块中的记录字段。
      op: "updateRecord";
      // 目标模块的稳定标识。
      module: string;
      // 目标记录在模块中的下标。
      index: number;
      // 目标字段名称。
      field: string;
      // 要写入的字段值。
      value: unknown;
    }
  | {
      // 操作类型：向数组型模块新增记录。
      op: "addRecord";
      // 目标模块的稳定标识。
      module: string;
      // 新记录的初始字段数据。
      record?: Record<string, unknown>;
    }
  | {
      // 操作类型：删除数组型模块中的记录。
      op: "deleteRecord";
      // 目标模块的稳定标识。
      module: string;
      // 要删除记录在模块中的下标。
      index: number;
    }
  | {
      // 操作类型：调整数组型模块中的记录顺序。
      op: "moveRecord";
      // 目标模块的稳定标识。
      module: string;
      // 记录移动前的下标。
      from: number;
      // 记录移动后的下标。
      to: number;
    };

// 新增记录的实际落点。
export interface ResumeAddedRecord {
  // 新记录所属模块的稳定标识。
  module: string;
  // 新记录写入后的下标。
  index: number;
}

// 宿主执行一批简历操作后的结构化结果。
export interface ResumeOperationResult {
  // 是否至少有一条操作已实际写入。
  applied: boolean;
  // 已成功执行的原始操作下标。
  changed: number[];
  // 本批操作新增记录的实际落点。
  added: ResumeAddedRecord[];
  // 执行失败的原始操作下标。
  failed: number[];
}
