import { describe, expect, it, vi } from "vitest";
import { createResumeOperationBuffer } from "./resumeOperationBuffer";

describe("createResumeOperationBuffer", () => {
  it("提交前不写入并在成功后整批执行", () => {
    const apply = vi.fn((operations) => ({
      applied: operations.length > 0,
      changed: operations.map((_: unknown, index: number) => index),
      added: [],
      failed: [],
    }));
    const buffer = createResumeOperationBuffer({ apply, getRecordCount: () => 2 });
    buffer.begin();

    const first = buffer.execute([{ op: "addRecord", module: "work" }]);
    const second = buffer.execute([
      { op: "updateRecord", module: "work", index: 2, field: "name", value: "新公司" },
    ]);

    expect(apply).not.toHaveBeenCalled();
    expect(first.added).toEqual([{ module: "work", index: 2 }]);
    expect(second.changed).toEqual([1]);
    buffer.commit();
    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply.mock.calls[0]?.[0]).toHaveLength(2);
  });

  it("取消后丢弃全部待执行操作", () => {
    const apply = vi.fn(() => ({ applied: true, changed: [], added: [], failed: [] }));
    const buffer = createResumeOperationBuffer({ apply, getRecordCount: () => 0 });
    buffer.begin();
    buffer.execute([{ op: "addRecord", module: "work" }]);

    buffer.discard();
    expect(buffer.commit().applied).toBe(false);
    expect(apply).not.toHaveBeenCalled();
  });
});
