import { createPinia, setActivePinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createApp } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAiStore } from "./ai";
import { useResumeStore } from "./resume";

const records = new Map<string, unknown>();

vi.mock("@vueuse/integrations/useIDBKeyval", async () => {
  const { ref } = await import("vue");
  return {
    useIDBKeyval: (key: string, initialValue: unknown) => {
      const data = ref(structuredClone(initialValue));
      const isFinished = ref(true);
      return { data, isFinished, set: async (value: unknown) => (data.value = value) };
    },
  };
});

vi.mock("idb-keyval", () => ({
  get: vi.fn(async (key: string) => records.get(key)),
  set: vi.fn(async (key: string, value: unknown) => records.set(key, value)),
  del: vi.fn(async (key: string) => records.delete(key)),
}));

describe("resume assistant persistence", () => {
  beforeEach(() => {
    records.clear();
    localStorage.clear();
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);
    pinia.install(createApp({}));
    setActivePinia(pinia);
  });

  it("creates a chat only after the first message and stores its summary under its resume", async () => {
    const resumeStore = useResumeStore();
    resumeStore.addResume({}, false, true);
    const resumeId = resumeStore.resumeList[0].id;
    const aiStore = useAiStore();
    const draft = {
      id: "chat-a",
      resumeId,
      title: "优化项目经历",
      createTime: 10,
      updateTime: 20,
      messages: [{ id: "message-a", role: "user", content: "优化项目经历" }],
    } as any;
    aiStore.registerResumeAssistantChatFactory(() => draft);
    const unsavedDraft = aiStore.createNewResumeAssistantChat();

    expect(records.has("resume-assistant-chat:chat-a")).toBe(false);
    expect(resumeStore.list[0].ai).toEqual([]);

    await aiStore.saveResumeAssistantChat(unsavedDraft!);

    expect(records.get("resume-assistant-chat:chat-a")).toMatchObject({
      id: "chat-a",
      resumeId,
      messages: [{ content: "优化项目经历" }],
    });
    expect(resumeStore.list[0].ai).toEqual([
      { id: "chat-a", title: "优化项目经历", createTime: 10, updateTime: 20 },
    ]);
    const persisted = JSON.parse(localStorage.getItem("resume") || "{}");
    expect(persisted.list).toEqual(resumeStore.list);
    expect(records.has("resume-list")).toBe(false);
  });

  it("retains chats after soft deletion and removes them with permanent resume deletion", async () => {
    const resumeStore = useResumeStore();
    resumeStore.addResume({}, false, true);
    const resumeId = resumeStore.resumeList[0].id;
    const aiStore = useAiStore();
    await aiStore.saveResumeAssistantChat({
      id: "chat-a",
      resumeId,
      title: "准备面试",
      createTime: 10,
      updateTime: 20,
      messages: [],
    });
    await aiStore.initializeResumeAssistantChat(resumeId);

    resumeStore.deleteResume();
    expect(aiStore.resumeAssistantChat).toBeNull();
    expect(records.has("resume-assistant-chat:chat-a")).toBe(true);
    expect(resumeStore.list[0].ai).toHaveLength(1);

    resumeStore.restoreResume(0);
    await aiStore.initializeResumeAssistantChat(resumeId);
    expect(aiStore.resumeAssistantChat?.id).toBe("chat-a");
    resumeStore.currentIndex = 0;
    resumeStore.deleteResume();

    await resumeStore.permanentlyDeleteResume(0);
    expect(records.has("resume-assistant-chat:chat-a")).toBe(false);
    expect(resumeStore.list).toEqual([]);
    expect(resumeStore.resumeList).toEqual([]);
  });

  it("loads only chats owned by the selected resume", async () => {
    const resumeStore = useResumeStore();
    resumeStore.addResume({}, false, false);
    const firstResumeId = resumeStore.resumeList[0].id;
    resumeStore.addResume({}, false, false);
    const secondResumeId = resumeStore.resumeList[1].id;
    const aiStore = useAiStore();

    await aiStore.saveResumeAssistantChat({
      id: "chat-a",
      resumeId: firstResumeId,
      title: "第一份简历",
      createTime: 10,
      updateTime: 20,
      messages: [],
    });
    await aiStore.saveResumeAssistantChat({
      id: "chat-b",
      resumeId: secondResumeId,
      title: "第二份简历",
      createTime: 30,
      updateTime: 40,
      messages: [],
    });

    await aiStore.initializeResumeAssistantChat(firstResumeId);
    expect(aiStore.resumeAssistantChat?.id).toBe("chat-a");
    await aiStore.initializeResumeAssistantChat(secondResumeId);
    expect(aiStore.resumeAssistantChat?.id).toBe("chat-b");
  });
});
