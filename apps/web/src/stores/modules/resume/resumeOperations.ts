// 语义化写操作：明确到模块、记录与字段，避免调用方直接拼装整棵数据
export type ResumeWriteOp =
  | {
      op: "updateModule";
      module: string;
      field: string;
      value: unknown;
    }
  | {
      op: "updateModuleTitle";
      module: string;
      title: string;
    }
  | {
      op: "updateRecord";
      module: string;
      index: number;
      field: string;
      value: unknown;
    }
  | {
      op: "addRecord";
      module: string;
      record?: Record<string, unknown>;
    }
  | {
      op: "deleteRecord";
      module: string;
      index: number;
    }
  | {
      op: "moveRecord";
      module: string;
      from: number;
      to: number;
    };

export type ResumeOperationTarget = {
  updateModuleField: (module: string, field: string, value: unknown) => boolean;
  updateModuleTitle: (module: string, title: string) => boolean;
  updateRecordField: (module: string, index: number, field: string, value: unknown) => boolean;
  addDataRecord: (module: string) => number;
  removeDataRecord: (module: string, index: number) => boolean;
  moveDataRecord: (module: string, from: number, to: number) => boolean;
  // 读取模块级字段当前值，用于逐项判断是否真的产生变化；未提供时按执行结果记为已变化
  readModuleField?: (module: string, field: string) => unknown;
  // 读取记录字段当前值，index 为记录下标
  readRecordField?: (module: string, index: number, field: string) => unknown;
  // 读取模块展示标题当前值
  readModuleTitle?: (module: string) => unknown;
};

export type ResumeOperationResult = {
  // 是否至少有一条操作已成功执行，包含执行成功但值未变化的情况
  applied: boolean;
  // 真正改变了数据的操作下标
  changed: number[];
  // 执行成功但值与原来相同的操作下标
  unchanged: number[];
  // 本批操作新增记录的实际落点
  added: Array<{ module: string; index: number }>;
  // 执行失败的原始操作下标
  failed: number[];
  // 新增记录中未能写入的字段，供调用方定位补填目标
  fieldFailures: Array<{ operationIndex: number; field: string }>;
};

type OperationOutcome = "changed" | "unchanged" | "failed";

// 操作前捕获快照，返回的回调仅在真实改动后执行；参数为新增记录的实际下标。
export type ResumeOperationObserver = (
  operation: ResumeWriteOp,
) => ((addedIndex?: number) => void) | undefined;

// 同值判断按可序列化结果比较，避免对象与数组按引用比较误判
const isSameValue = (first: unknown, second: unknown) =>
  JSON.stringify(first ?? null) === JSON.stringify(second ?? null);

// 按声明顺序执行语义化操作，调用方只负责提供具体数据写入能力
export const executeResumeOperations = (
  operations: ResumeWriteOp[],
  target: ResumeOperationTarget,
  observe?: ResumeOperationObserver,
): ResumeOperationResult => {
  const changed: number[] = [];
  const unchanged: number[] = [];
  const failed: number[] = [];
  const added: Array<{ module: string; index: number }> = [];
  const fieldFailures: Array<{ operationIndex: number; field: string }> = [];

  operations.forEach((operation, operationIndex) => {
    let outcome: OperationOutcome = "failed";
    let addedIndex: number | undefined;
    let notifyChange: ReturnType<ResumeOperationObserver> = undefined;
    // 展示层快照失败不能阻断既有写入。
    try { notifyChange = observe?.(operation); } catch { /* 继续执行原操作 */ }

    if (operation.op === "updateModule") {
      const before = target.readModuleField?.(operation.module, operation.field);
      if (target.updateModuleField(operation.module, operation.field, operation.value)) {
        // 未提供读取能力时无法比较，按写入成功记为已变化
        const after = target.readModuleField?.(operation.module, operation.field);
        outcome = target.readModuleField && isSameValue(before, after) ? "unchanged" : "changed";
      }
    } else if (operation.op === "updateModuleTitle") {
      const before = target.readModuleTitle?.(operation.module);
      if (target.updateModuleTitle(operation.module, operation.title)) {
        const after = target.readModuleTitle?.(operation.module);
        outcome = target.readModuleTitle && isSameValue(before, after) ? "unchanged" : "changed";
      }
    } else if (operation.op === "updateRecord") {
      const before = target.readRecordField?.(operation.module, operation.index, operation.field);
      if (
        target.updateRecordField(
          operation.module,
          operation.index,
          operation.field,
          operation.value,
        )
      ) {
        const after = target.readRecordField?.(operation.module, operation.index, operation.field);
        outcome = target.readRecordField && isSameValue(before, after) ? "unchanged" : "changed";
      }
    } else if (operation.op === "addRecord") {
      const index = target.addDataRecord(operation.module);
      if (index >= 0) {
        addedIndex = index;
        added.push({ module: operation.module, index });
        // 记录已创建即产生数据变化；字段写入失败通过 fieldFailures 单独上报，
        // 不能整条记为失败，否则调用方会重提同一条新增而产生重复记录
        Object.entries(operation.record ?? {}).forEach(([field, value]) => {
          if (!target.updateRecordField(operation.module, index, field, value)) {
            fieldFailures.push({ operationIndex, field });
          }
        });
        outcome = "changed";
      }
    } else if (operation.op === "deleteRecord") {
      if (target.removeDataRecord(operation.module, operation.index)) outcome = "changed";
    } else if (operation.op === "moveRecord") {
      if (target.moveDataRecord(operation.module, operation.from, operation.to)) outcome = "changed";
    }

    if (outcome === "changed") {
      changed.push(operationIndex);
      // 通知仅处理展示数据，失败不改变原接口执行结果。
      try { notifyChange?.(addedIndex); } catch { /* 保留真实写入结果 */ }
    }
    else if (outcome === "unchanged") unchanged.push(operationIndex);
    else failed.push(operationIndex);
  });

  return {
    // 同值写入同样属于执行成功，只有全部失败时才算未应用
    applied: changed.length + unchanged.length > 0,
    changed,
    unchanged,
    added,
    failed,
    fieldFailures,
  };
};
