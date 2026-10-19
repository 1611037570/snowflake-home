import { describe, expect, it, vi } from "vitest";
import { createUpdateResumeLanguageTool } from "./tool_update_resume_language";

// 语言同步必须依赖当前请求已经完成的简历写入
describe("createUpdateResumeLanguageTool", () => {
  const createContext = (hasSuccessfulWrite: boolean) => {
    const updateLanguage = vi.fn(() => true);
    return {
      updateLanguage,
      context: {
        getResumeData: () => ({}),
        applyResumeOperations: vi.fn(),
        hasSuccessfulWrite: () => hasSuccessfulWrite,
        updateLanguage,
      },
    };
  };

  it("未写入翻译内容时拒绝切换语言", () => {
    const { context, updateLanguage } = createContext(false);
    const tool = createUpdateResumeLanguageTool(context as any);

    expect(tool.execute({ language: "en" })).toMatchObject({
      updated: false,
      error: expect.stringContaining("尚未通过 propose_resume_edits"),
    });
    expect(updateLanguage).not.toHaveBeenCalled();
  });

  it("当前请求写入成功后允许切换语言", () => {
    const { context, updateLanguage } = createContext(true);
    const tool = createUpdateResumeLanguageTool(context as any);

    expect(tool.execute({ language: "en" })).toEqual({ updated: true });
    expect(updateLanguage).toHaveBeenCalledWith("en");
  });
});
