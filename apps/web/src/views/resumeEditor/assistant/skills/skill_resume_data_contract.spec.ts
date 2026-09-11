import { describe, expect, it } from "vitest";
import { resumeDataContract } from "./skill_resume_data_contract";

describe("resumeDataContract", () => {
  it("从当前领域结构生成模块和字段契约", () => {
    const instructions = resumeDataContract().instructions;

    expect(instructions).toContain("`user` | 个人信息 | 对象");
    expect(instructions).toContain("`email` | 邮箱 | string | 否 | 可添加字段");
    expect(instructions).toContain('可选值 "在职" / "离职" / "应届生"');
    expect(instructions).toContain('格式 ["开始.YYYY.MM", "结束.YYYY.MM"]');
    expect(instructions).toContain("`custom_<id>.data.list[]`");
  });
});
