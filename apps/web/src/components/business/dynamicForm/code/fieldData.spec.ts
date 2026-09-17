import { computed, reactive } from "vue";
import { describe, expect, it } from "vitest";
import type { FormField } from "../types";
import {
  addFieldData,
  getFieldDataKey,
  getFieldOwnPaths,
  hasFieldData,
  removeFieldNode,
} from "./fieldData";

const emailField: FormField = {
  type: "object",
  component: "input",
  addable: true,
  model: {
    source: ["user", "data", "email"],
    prop: "modelValue",
  },
};

// 包裹组：字段状态绑定在包裹组上，共享绑定与字段绑定混在一起
const positionField: FormField = {
  type: "group",
  component: "fieldItem",
  key: "position",
  model: [
    { source: ["user", "ui", "position", "hidden"], prop: "hidden", defaultValue: false },
    { source: ["user", "ui", "position", "icon"], prop: "icon", defaultValue: "lucide:briefcase" },
    { source: ["user", "ui", "shared"], prop: "sharedValue", defaultValue: [] },
  ],
  fields: [
    {
      type: "object",
      key: "position",
      component: "input",
      model: { source: ["user", "data", "position"], prop: "modelValue" },
    },
  ],
};

describe("fieldData", () => {
  it("使用主数据路径生成稳定标识", () => {
    expect(getFieldDataKey(emailField)).toBe("user.data.email");
    expect(getFieldDataKey({} as FormField)).toBeUndefined();
  });

  it("按属性存在性判断字段是否已添加", () => {
    const data = { user: { data: { email: "" } } };

    expect(hasFieldData(data, emailField)).toBe(true);
    expect(hasFieldData({ user: { data: {} } }, emailField)).toBe(false);
  });

  it("新增字段后触发响应式存在性更新", () => {
    const data = reactive({ user: { data: {} } });
    const active = computed(() => hasFieldData(data, emailField));

    expect(active.value).toBe(false);
    addFieldData(data, emailField);
    expect(active.value).toBe(true);
  });

  it("按主数据路径创建统一默认值", () => {
    const data = {};

    expect(addFieldData(data, emailField)).toBe(true);
    expect(data).toEqual({ user: { data: { email: "" } } });
    expect(addFieldData(data, emailField)).toBe(false);
  });

  it("为引用类型默认值创建独立副本", () => {
    const field: FormField = {
      type: "object",
      component: "input",
      model: {
        source: ["user", "data", "tags"],
        prop: "modelValue",
        defaultValue: [],
      },
    };
    const first = {};
    const second = {};

    addFieldData(first, field);
    addFieldData(second, field);

    expect((first as any).user.data.tags).toEqual([]);
    expect((first as any).user.data.tags).not.toBe((second as any).user.data.tags);
  });

  it("支持按数组记录上下文解析相对字段", () => {
    const field: FormField = {
      type: "object",
      component: "input",
      model: {
        source: ["summary"],
        prop: "modelValue",
        defaultValue: "待填写",
      },
    };
    const data = { work: { data: [{}] } };
    const context = { basePath: ["work", "data"], index: 0 };

    expect(getFieldDataKey(field, context)).toBe("work.data.0.summary");
    expect(addFieldData(data, field, context)).toBe(true);
    expect(hasFieldData(data, field, context)).toBe(true);
    expect(data.work.data[0]).toEqual({ summary: "待填写" });
    expect(hasFieldData(data, field)).toBe(false);
  });

  it("遇到无效路径时不覆盖已有数据", () => {
    const data = { user: "已有内容" };

    expect(addFieldData(data, emailField)).toBe(false);
    expect(data.user).toBe("已有内容");
  });

  it("只收集节点独占的绑定路径，共享路径不参与删除", () => {
    expect(getFieldOwnPaths(positionField)).toEqual([
      ["user", "ui", "position"],
      ["user", "data", "position"],
    ]);
  });

  it("删除节点时清理节点独占的数据与界面配置", () => {
    const data = {
      user: {
        ui: {
          position: { hidden: true, icon: "lucide:briefcase" },
          shared: ["position"],
        },
        data: { position: "前端开发" },
      },
    };
    const container = { fields: [positionField] };

    expect(removeFieldNode(container, positionField, data)).toBe(true);
    expect(container.fields).toEqual([]);
    expect(data.user.data.position).toBeUndefined();
    expect(data.user.ui.position).toBeUndefined();
    // 共享绑定由多个节点声明，不属于该节点
    expect(data.user.ui.shared).toEqual(["position"]);
  });

  it("节点不在容器内时不改动数据", () => {
    const data = {
      user: {
        ui: { position: { hidden: true } },
        data: { position: "前端开发" },
      },
    };

    expect(removeFieldNode({ fields: [] }, positionField, data)).toBe(false);
    expect(data.user.data.position).toBe("前端开发");
    expect(data.user.ui.position).toEqual({ hidden: true });
  });
});
