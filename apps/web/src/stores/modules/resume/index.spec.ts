import { createPinia, setActivePinia } from "pinia";
import { nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useResumeStore } from "./index";

vi.mock("@/components/business/confirm", () => ({ default: vi.fn() }));
vi.mock("@/routers", () => ({ default: { push: vi.fn() } }));
vi.mock("@/utils", () => ({ getUUID: () => "test-resume-id" }));
vi.mock("@vueuse/integrations/useIDBKeyval", async () => {
  const { ref } = await import("vue");
  return {
    useIDBKeyval: (_key: string, initialValue: unknown) => {
      const data = ref(structuredClone(initialValue));
      const isFinished = ref(true);
      return { data, isFinished, set: async (value: unknown) => (data.value = value) };
    },
  };
});
vi.mock("idb-keyval", () => ({
  get: vi.fn(async () => []),
  set: vi.fn(async () => undefined),
  del: vi.fn(async () => undefined),
}));
vi.mock("./formConfig", () => {
  const user = {
    type: "group",
    key: "user",
    context: ["user"],
    fields: [
      {
        type: "object",
        component: "input",
        model: { source: ["data", "birthday"], prop: "modelValue" },
      },
      {
        type: "object",
        component: "input",
        addable: true,
        model: { source: ["data", "email"], prop: "modelValue" },
      },
    ],
  };
  return {
    allConfig: { user },
    COLLAPSED: ["1"],
    DEFAULT_CONFIG: { fields: [{ key: "user" }] },
    DEFAULT_USER_FORM: [user],
    EXPANDED: [],
  };
});

describe("resume store applyResumeOperations", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("允许写入运行时结构声明的可添加字段", async () => {
    const store = useResumeStore();
    store.addResume(
      {
        data: {
          user: {
            data: { name: "张三" },
            ui: { title: "个人信息" },
          },
        },
        config: { fields: [{ key: "user" }] },
      },
      false,
      true,
    );
    await nextTick();

    expect(
      store.applyResumeOperations([
        {
          op: "updateModule",
          module: "user",
          field: "email",
          value: "test@example.com",
        },
      ]).applied,
    ).toBe(true);
    expect(store.currentData.user.data.email).toBe("test@example.com");
  });

  it("拒绝写入缺失的普通字段与未知字段", async () => {
    const store = useResumeStore();
    store.addResume(
      {
        data: {
          user: {
            data: { name: "张三" },
            ui: { title: "个人信息" },
          },
        },
        config: { fields: [{ key: "user" }] },
      },
      false,
      true,
    );
    await nextTick();

    expect(
      store.applyResumeOperations([
        { op: "updateModule", module: "user", field: "birthday", value: "2000.01" },
      ]).applied,
    ).toBe(false);
    expect(
      store.applyResumeOperations([
        { op: "updateModule", module: "user", field: "unknown", value: "任意内容" },
      ]).applied,
    ).toBe(false);
  });

  it("通过统一入口批量执行语义化操作", async () => {
    const store = useResumeStore();
    store.addResume(
      {
        data: {
          user: {
            data: { name: "张三" },
            ui: { title: "个人信息" },
          },
        },
        config: { fields: [{ key: "user" }] },
      },
      false,
      true,
    );
    await nextTick();

    const result = store.applyResumeOperations([
      { op: "updateModule", module: "user", field: "name", value: "李四" },
      { op: "updateModuleTitle", module: "user", title: "基本资料" },
    ]);

    expect(result).toMatchObject({ applied: true, changed: [0, 1], failed: [] });
    expect(store.currentData.user).toMatchObject({
      data: { name: "李四" },
      ui: { title: "基本资料" },
    });
  });

  it("软删除与恢复只切换目录标记，并保留 AI 会话摘要", () => {
    const store = useResumeStore();
    store.addResume({}, false, true);
    store.updateResumeAiChatSummary("test-r", {
      id: "chat-a",
      title: "优化经历",
      createTime: 10,
      updateTime: 20,
    });

    store.deleteResume();

    expect(store.list[0]).toMatchObject({ id: "test-r", deletedAt: expect.any(Number) });
    expect(store.list[0]?.ai).toHaveLength(1);
    expect(store.resumeList).toHaveLength(0);
    expect(store.trashList[0]?._deletedAt).toEqual(store.list[0]?.deletedAt);

    store.restoreResume(0);

    expect(store.list[0]?.deletedAt).toBeNull();
    expect(store.list[0]?.ai).toHaveLength(1);
    expect(store.resumeList).toHaveLength(1);
    expect(store.trashList).toHaveLength(0);
  });
});
