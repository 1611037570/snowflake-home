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
};

export type ResumeOperationResult = {
  applied: boolean;
  changed: number[];
  added: Array<{ module: string; index: number }>;
  failed: number[];
};

// 按声明顺序执行语义化操作，调用方只负责提供具体数据写入能力
export const executeResumeOperations = (
  operations: ResumeWriteOp[],
  target: ResumeOperationTarget,
): ResumeOperationResult => {
  const changed: number[] = [];
  const failed: number[] = [];
  const added: Array<{ module: string; index: number }> = [];

  operations.forEach((operation, operationIndex) => {
    let applied = false;
    if (operation.op === "updateModule") {
      applied = target.updateModuleField(operation.module, operation.field, operation.value);
    } else if (operation.op === "updateModuleTitle") {
      applied = target.updateModuleTitle(operation.module, operation.title);
    } else if (operation.op === "updateRecord") {
      applied = target.updateRecordField(
        operation.module,
        operation.index,
        operation.field,
        operation.value,
      );
    } else if (operation.op === "addRecord") {
      const index = target.addDataRecord(operation.module);
      if (index >= 0) {
        applied = true;
        added.push({ module: operation.module, index });
        Object.entries(operation.record ?? {}).forEach(([field, value]) => {
          target.updateRecordField(operation.module, index, field, value);
        });
      }
    } else if (operation.op === "deleteRecord") {
      applied = target.removeDataRecord(operation.module, operation.index);
    } else if (operation.op === "moveRecord") {
      applied = target.moveDataRecord(operation.module, operation.from, operation.to);
    }

    if (applied) changed.push(operationIndex);
    else failed.push(operationIndex);
  });

  return { applied: changed.length > 0, changed, added, failed };
};
