import { describe, expect, it } from "vitest";
import { resumeDataContract } from "@snowflake/resume-agent/skills/skill_resume_data_contract";
import { registerResumeAgentSchema } from "./resumeSchemaProvider";

registerResumeAgentSchema();

describe("resumeDataContract", () => {
  it("从当前领域结构生成模块和字段契约", () => {
    const instructions = resumeDataContract().instructions;

    expect(instructions).toContain("`user` | 个人信息 | 对象");
    // 备注列以填写口径开头，断言字段行与可添加标记，不绑定列内顺序
    expect(instructions).toContain("| `email` | 邮箱 | string | ");
    expect(instructions).toContain("可添加字段，缺失时允许通过 updateModule 激活");
    expect(instructions).toContain('可选值 "在职" / "离职" / "应届生"');
    expect(instructions).toContain("持续中时填 至今");
    expect(instructions).toContain("`custom_<id>.data[]`");
  });
});
