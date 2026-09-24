import { describe, expect, it } from "vitest";
import {
  createResumeListItem,
  removeResumeListItem,
  removeAiChatSummaries,
  setResumeDeletedAt,
  upsertAiChatSummary,
} from "./resumeCatalog";

describe("resume catalog", () => {
  it("creates an active resume directory entry with no chats", () => {
    expect(createResumeListItem("resume-a")).toEqual({
      id: "resume-a",
      ai: [],
      deletedAt: null,
    });
  });

  it("keeps one summary per chat and moves updated summaries to the front", () => {
    const item = createResumeListItem("resume-a");
    const first = { id: "chat-a", title: "旧标题", createTime: 1, updateTime: 2 };
    const second = { id: "chat-b", title: "另一个话题", createTime: 3, updateTime: 4 };
    const updated = { ...first, title: "新标题", updateTime: 5 };

    const withChats = upsertAiChatSummary(upsertAiChatSummary(item, first), second);

    expect(upsertAiChatSummary(withChats, updated).ai).toEqual([updated, second]);
  });

  it("clears only the chat summaries when permanently removing related chats", () => {
    const item = upsertAiChatSummary(createResumeListItem("resume-a"), {
      id: "chat-a",
      title: "话题",
      createTime: 1,
      updateTime: 2,
    });

    expect(removeAiChatSummaries(item)).toMatchObject({ id: "resume-a", ai: [] });
    expect(item.ai).toHaveLength(1);
  });

  it("keeps resume and AI data linked while moving between active and trash states", () => {
    const item = upsertAiChatSummary(createResumeListItem("resume-a"), {
      id: "chat-a",
      title: "话题",
      createTime: 1,
      updateTime: 2,
    });
    const deleted = setResumeDeletedAt(item, 100);

    expect(deleted).toMatchObject({ id: "resume-a", deletedAt: 100, ai: item.ai });
    expect(setResumeDeletedAt(deleted, null)).toMatchObject({
      id: "resume-a",
      deletedAt: null,
      ai: item.ai,
    });
  });

  it("removes a resume directory entry only for permanent deletion", () => {
    const item = createResumeListItem("resume-a");

    expect(removeResumeListItem([item], "resume-a")).toEqual([]);
  });
});
