import { describe, expect, it } from "vitest";
import { validateResumeEdits, type ResumeWriteOp } from "./resumeEdits";

const validateUserOperation = (operation: ResumeWriteOp) =>
  validateResumeEdits([operation], {
    user: {
      title: "个人信息",
      data: { name: "张三" },
    },
  });

describe("validateResumeEdits", () => {
  it("允许写入尚未存在的可添加字段", () => {
    expect(
      validateUserOperation({
        op: "updateModule",
        module: "user",
        field: "email",
        value: "test@example.com",
      }),
    ).toEqual([]);
  });

  it("继续拒绝尚未存在的普通字段与未知字段", () => {
    expect(
      validateUserOperation({
        op: "updateModule",
        module: "user",
        field: "birthday",
        value: "2000.01",
      }),
    ).toContain("第 1 条操作：模块 user 不存在模块级字段 birthday");
    expect(
      validateUserOperation({
        op: "updateModule",
        module: "user",
        field: "unknown",
        value: "任意内容",
      }),
    ).toContain("第 1 条操作：模块 user 不存在字段 unknown");
  });

  it("对可添加字段继续执行格式校验", () => {
    expect(
      validateUserOperation({
        op: "updateModule",
        module: "user",
        field: "workTime",
        value: "2026-09",
      }),
    ).toContain("模块 user 字段 workTime 应为 YYYY.MM 格式（如 2023.07），实际值无效");
  });

  it("按表单字典拒绝无效枚举值", () => {
    expect(
      validateUserOperation({
        op: "updateModule",
        module: "user",
        field: "status",
        value: "未知状态",
      }),
    ).toContain("模块 user 字段 status 可选值应为：在职 / 离职 / 应届生");
  });

  it("校验身高体重字段的对象结构", () => {
    expect(
      validateUserOperation({
        op: "updateModule",
        module: "user",
        field: "heightWeight",
        value: { height: "180", weight: 70 },
      }),
    ).toContain("模块 user 字段 heightWeight 应为包含数字 height 和 weight 的对象");
  });
});
