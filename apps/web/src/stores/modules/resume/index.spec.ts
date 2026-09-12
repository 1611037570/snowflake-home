import { createPinia, setActivePinia } from "pinia";
import { nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useResumeStore } from "./index";

vi.mock("@/components/business/confirm", () => ({ default: vi.fn() }));
vi.mock("@/routers", () => ({ default: { push: vi.fn() } }));
vi.mock("@/utils", () => ({ getUUID: () => "test-resume-id" }));
vi.mock("./formConfig", () => {
  const user = {
    type: "group",
    key: "user",
    fields: [
      {
        type: "object",
        component: "input",
        model: { source: ["user", "data", "birthday"], prop: "modelValue" },
      },
      {
        type: "object",
        component: "input",
        addable: true,
        model: { source: ["user", "data", "email"], prop: "modelValue" },
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
});
