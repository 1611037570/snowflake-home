import { describe, expect, it } from "vitest";
import { executeResumeOperations, type ResumeOperationTarget } from "./resumeOperationExecutor";

describe("executeResumeOperations", () => {
  it("按顺序执行全部语义化写操作", () => {
    const data: any = {
      user: { title: "个人信息", data: { name: "张三" } },
      work: { data: [{ name: "甲公司" }, { name: "乙公司" }] },
    };
    const target: ResumeOperationTarget = {
      updateModuleField: (module, field, value) => {
        data[module].data[field] = value;
        return true;
      },
      updateModuleTitle: (module, title) => {
        data[module].title = title;
        return true;
      },
      updateRecordField: (module, index, field, value) => {
        data[module].data[index][field] = value;
        return true;
      },
      addDataRecord: (module) => data[module].data.push({ name: "" }) - 1,
      removeDataRecord: (module, index) => data[module].data.splice(index, 1).length > 0,
      moveDataRecord: (module, from, to) => {
        const [record] = data[module].data.splice(from, 1);
        data[module].data.splice(to, 0, record);
        return true;
      },
    };

    const result = executeResumeOperations(
      [
        { op: "updateModule", module: "user", field: "name", value: "李四" },
        { op: "updateModuleTitle", module: "user", title: "基本资料" },
        { op: "updateRecord", module: "work", index: 0, field: "name", value: "新甲公司" },
        { op: "addRecord", module: "work", record: { name: "丙公司" } },
        { op: "moveRecord", module: "work", from: 2, to: 0 },
        { op: "deleteRecord", module: "work", index: 1 },
      ],
      target,
    );

    expect(data.user).toEqual({ title: "基本资料", data: { name: "李四" } });
    expect(data.work.data).toEqual([{ name: "丙公司" }, { name: "乙公司" }]);
    expect(result).toEqual({
      applied: true,
      changed: [0, 1, 2, 3, 4, 5],
      added: [{ module: "work", index: 2 }],
      failed: [],
    });
  });

  it("记录未执行成功的操作下标", () => {
    const target = {
      updateModuleField: () => false,
      updateModuleTitle: () => false,
      updateRecordField: () => false,
      addDataRecord: () => -1,
      removeDataRecord: () => false,
      moveDataRecord: () => false,
    };

    expect(
      executeResumeOperations(
        [{ op: "updateModule", module: "user", field: "name", value: "李四" }],
        target,
      ),
    ).toEqual({ applied: false, changed: [], added: [], failed: [0] });
  });
});
