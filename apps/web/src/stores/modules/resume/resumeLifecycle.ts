import { getUUID } from "@/utils";
import { merge } from "lodash-es";
import {
  createResumeListItem,
  removeAiChatSummaries,
  removeResumeListItem,
  setResumeDeletedAt,
  type AiChatSummary,
  type ResumeListItem,
  upsertAiChatSummary,
} from "./resumeCatalog";

type ResumeLifecycleOptions = {
  list: { value: ResumeListItem[] };
  resumeRecords: { value: any[] };
  resumeList: { value: any[] };
  trashList: { value: any[] };
  currentIndex: { value: number };
  maxCount: number;
  maxTrashCount: number;
  trashRetentionMs: number;
  defaultResumeItem: any;
  getResumeStorage: (id: string, initialValue?: any, writeDefaults?: boolean) => any;
  removeResumeStorage: (id: string) => Promise<void>;
  setConfigFields: (item: any, fields: any[]) => void;
  compactConfigFields: (fields: any[]) => any[];
  deepClone: (value: any) => any;
  clearCurrentAssistantChat: (resumeId: string) => void;
  removeAssistantChats: (resumeId: string) => Promise<void>;
  onResumeLimit: () => void;
  onTrashLimit: () => void;
  onRestoreLimit: () => void;
  navigateToEditor: (resumeId: string) => void;
};

export const createResumeLifecycle = (options: ResumeLifecycleOptions) => {
  const {
    list,
    resumeRecords,
    resumeList,
    trashList,
    currentIndex,
    maxCount,
    maxTrashCount,
    trashRetentionMs,
    defaultResumeItem,
    getResumeStorage,
    removeResumeStorage,
    setConfigFields,
    compactConfigFields,
    deepClone,
    clearCurrentAssistantChat,
    removeAssistantChats,
    onResumeLimit,
    onTrashLimit,
    onRestoreLimit,
    navigateToEditor,
  } = options;

  const mergeResumeItem = (item: any) => merge(structuredClone(defaultResumeItem), item);
  const addResume = (config: any, jump = true, select = true) => {
    if (resumeList.value.length >= maxCount) {
      onResumeLimit();
      return false;
    }
    const resume = config ? mergeResumeItem(config) : structuredClone(defaultResumeItem);
    setConfigFields(resume, compactConfigFields(resume.config.fields));
    resume.id = getUUID().slice(0, 6);
    const storage = getResumeStorage(resume.id, resume, true);
    resumeRecords.value.push(storage.data.value);
    list.value.unshift(createResumeListItem(resume.id));
    if (select) {
      currentIndex.value = resumeList.value.length - 1;
      if (jump) navigateToEditor(resume.id);
    }
    return true;
  };
  const duplicateResume = (item?: any) => {
    const source = item ?? resumeList.value[currentIndex.value];
    if (!source) return false;
    const copy = deepClone(source);
    const now = Date.now();
    copy.usage = { ...copy.usage, createTime: now, lastUseTime: now };
    const currentCount = resumeList.value.length;
    if (!addResume(copy, false, false)) return "";
    return resumeList.value[currentCount]?.id || "";
  };
  const deleteResume = () => {
    if (currentIndex.value === -1) return;
    if (trashList.value.length >= maxTrashCount) {
      onTrashLimit();
      return;
    }
    const deletedItem = resumeList.value[currentIndex.value];
    const entry = list.value.find((item) => item.id === deletedItem?.id);
    if (!entry) return;
    list.value[list.value.indexOf(entry)] = setResumeDeletedAt(entry, Date.now());
    clearCurrentAssistantChat(deletedItem.id);
    currentIndex.value = -1;
  };
  const restoreResume = (trashIndex: number) => {
    if (trashIndex < 0 || trashIndex >= trashList.value.length) return;
    if (resumeList.value.length >= maxCount) {
      onRestoreLimit();
      return;
    }
    const item = trashList.value[trashIndex];
    const entry = list.value.find((value) => value.id === item?.id);
    const resume = resumeRecords.value.find((value) => value.id === item?.id);
    if (!entry || !resume) return;
    list.value[list.value.indexOf(entry)] = setResumeDeletedAt(entry, null);
  };
  const permanentlyDeleteResume = async (trashIndex: number) => {
    if (trashIndex < 0 || trashIndex >= trashList.value.length) return;
    const item = trashList.value[trashIndex];
    await removeAssistantChats(item.id);
    list.value = removeResumeListItem(list.value, item.id);
    resumeRecords.value = resumeRecords.value.filter((resume) => resume.id !== item.id);
    await removeResumeStorage(item.id);
  };
  const clearTrash = async () => {
    const ids = trashList.value.map((item) => item.id);
    for (const id of ids) {
      await removeAssistantChats(id);
      await removeResumeStorage(id);
    }
    list.value = list.value.filter((entry) => !ids.includes(entry.id));
    resumeRecords.value = resumeRecords.value.filter((item) => !ids.includes(item.id));
  };
  const cleanExpiredTrash = async () => {
    const now = Date.now();
    const expiredIds = list.value
      .filter((item) => item.deletedAt !== null && now - item.deletedAt >= trashRetentionMs)
      .map((item) => item.id);
    for (const id of expiredIds) {
      await removeAssistantChats(id);
      await removeResumeStorage(id);
    }
    if (!expiredIds.length) return;
    list.value = list.value.filter((item) => !expiredIds.includes(item.id));
    resumeRecords.value = resumeRecords.value.filter((item) => !expiredIds.includes(item.id));
  };
  const getTrashRemainingDays = (item: any) => {
    const deletedAt = item?._deletedAt || 0;
    if (!deletedAt) return 0;
    const remaining = trashRetentionMs - (Date.now() - deletedAt);
    return remaining <= 0 ? 0 : Math.ceil(remaining / (24 * 60 * 60 * 1000));
  };
  const updateResumeAiChatSummary = async (resumeId: string, summary: AiChatSummary) => {
    const index = list.value.findIndex((item) => item.id === resumeId);
    const item = list.value[index];
    if (!item || item.deletedAt !== null) return false;
    list.value[index] = upsertAiChatSummary(item, summary);
    return true;
  };
  const clearResumeAiChatSummaries = async (resumeId: string) => {
    const index = list.value.findIndex((item) => item.id === resumeId);
    const item = list.value[index];
    if (!item) return [] as string[];
    const ids = item.ai.map((chat) => chat.id);
    list.value[index] = removeAiChatSummaries(item);
    return ids;
  };

  return {
    addResume,
    duplicateResume,
    deleteResume,
    restoreResume,
    permanentlyDeleteResume,
    clearTrash,
    cleanExpiredTrash,
    getTrashRemainingDays,
    updateResumeAiChatSummary,
    clearResumeAiChatSummaries,
  };
};
