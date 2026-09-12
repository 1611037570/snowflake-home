import type {
  ResumeOperationResult,
  ResumeWriteOp,
} from "@/stores/modules/resume/resumeOperations";

type ResumeOperationBufferOptions = {
  apply: (operations: ResumeWriteOp[]) => ResumeOperationResult;
  getRecordCount: (module: string) => number;
};

// 请求期间只收集语义操作，成功后整批落库，取消时直接丢弃
export const createResumeOperationBuffer = ({
  apply,
  getRecordCount,
}: ResumeOperationBufferOptions) => {
  const pending: ResumeWriteOp[] = [];
  const recordCounts = new Map<string, number>();
  let active = false;

  const getVirtualRecordCount = (module: string) => {
    if (!recordCounts.has(module)) recordCounts.set(module, getRecordCount(module));
    return recordCounts.get(module)!;
  };

  const execute = (operations: ResumeWriteOp[]): ResumeOperationResult => {
    if (!active) return apply(operations);
    const added: Array<{ module: string; index: number }> = [];
    operations.forEach((operation) => {
      if (operation.op === "addRecord") {
        const index = getVirtualRecordCount(operation.module);
        added.push({ module: operation.module, index });
        recordCounts.set(operation.module, index + 1);
      } else if (operation.op === "deleteRecord") {
        const count = getVirtualRecordCount(operation.module);
        recordCounts.set(operation.module, Math.max(0, count - 1));
      }
    });
    pending.push(...operations);
    return {
      applied: operations.length > 0,
      changed: operations.map((_, index) => index),
      added,
      failed: [],
    };
  };

  const begin = () => {
    active = true;
  };

  const commit = () => {
    active = false;
    recordCounts.clear();
    const operations = pending.splice(0);
    return operations.length
      ? apply(operations)
      : { applied: false, changed: [], added: [], failed: [] };
  };

  const discard = () => {
    active = false;
    pending.length = 0;
    recordCounts.clear();
  };

  return { begin, execute, commit, discard };
};
