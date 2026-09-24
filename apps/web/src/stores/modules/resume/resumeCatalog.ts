export type AiChatSummary = {
  id: string;
  title: string;
  createTime: number;
  updateTime: number;
};

export type ResumeListItem = {
  id: string;
  ai: AiChatSummary[];
  deletedAt: number | null;
};

export const createResumeListItem = (id: string): ResumeListItem => ({
  id,
  ai: [],
  deletedAt: null,
});

export const upsertAiChatSummary = (
  item: ResumeListItem,
  summary: AiChatSummary,
): ResumeListItem => ({
  ...item,
  ai: [summary, ...item.ai.filter((chat) => chat.id !== summary.id)],
});

export const removeAiChatSummaries = (item: ResumeListItem): ResumeListItem => ({
  ...item,
  ai: [],
});

export const setResumeDeletedAt = (
  item: ResumeListItem,
  deletedAt: number | null,
): ResumeListItem => ({ ...item, deletedAt });

export const removeResumeListItem = (list: ResumeListItem[], id: string) =>
  list.filter((item) => item.id !== id);
