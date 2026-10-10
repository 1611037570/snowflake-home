import { reactive } from "vue";
import { describe, expect, it, vi } from "vitest";
import type { FormField } from "../types";
import { createArrayItemData, initializeFormData, resolveDefaultValue } from "./schemaData";

describe("schemaData", () => {
  it("挂载前补齐已有记录，保留已有值并跳过可选字段及外部字典", () => {
    const defaultValue = vi.fn(() => "默认正文");
    const data: Record<string, any> = { work: { list: [{ data: { content: "已有正文" } }, {}] } };
    const fields: FormField[] = [{
      type: "group", // 模块容器类型。
      context: ["work"], // 模块数据路径。
      fields: [{
        type: "array", // 已有记录容器。
        source: ["list"], // 记录列表相对路径。
        itemSchema: {
          type: "group", // 记录字段容器。
          fields: [{
            type: "object", // 正文字段类型。
            component: "input", // 输入组件标识。
            model: { source: ["data", "content"], prop: "modelValue", defaultValue }, // 正文绑定及默认值。
          }, {
            type: "object", // 可选字段类型。
            component: "input", // 输入组件标识。
            addable: true, // 只有已添加的字段才初始化。
            model: { source: ["data", "optional"], prop: "modelValue", defaultValue: "可选" }, // 可选值绑定。
          }, {
            type: "object", // 字典字段类型。
            component: "select", // 选择组件标识。
            model: { source: ["options"], prop: "options", raw: true }, // 只读外部字典绑定。
          }],
        },
      }],
    }];
    initializeFormData(data, fields);
    initializeFormData(data, fields);
    expect(data).toEqual({ work: { list: [{ data: { content: "已有正文" } }, { data: { content: "默认正文" } }] } });
    expect(defaultValue).toHaveBeenCalledTimes(1);
  });

  it("不新增记录、不覆盖空值，归档模块保持原状", () => {
    const fields: FormField[] = [{
      type: "group", // 模块容器类型。
      context: ["work"], // 模块数据路径。
      checks: { removed: { path: ["archived"] } }, // 归档状态判断路径。
      model: { source: ["title"], prop: "title", defaultValue: "工作" }, // 标题默认绑定。
      fields: [{ type: "array", source: ["list"], itemSchema: { type: "group", fields: [] } }], // 现有记录结构。
    }];
    const data = { work: { title: "", list: [] } }; // 已有空标题与空列表。
    initializeFormData(data, fields);
    expect(data).toEqual({ work: { title: "", list: [] } });
    const archived = { work: { archived: true } }; // 已归档模块。
    initializeFormData(archived, fields);
    expect(archived).toEqual({ work: { archived: true } });
  });
  it("统一解析基础默认值", () => {
    expect(resolveDefaultValue(undefined)).toBe("");
    expect(resolveDefaultValue(null)).toBe("");
    expect(resolveDefaultValue(false)).toBe(false);
    expect(resolveDefaultValue(0)).toBe(0);
    expect(resolveDefaultValue(50)).toBe(50);
  });

  it("执行函数默认值并克隆引用类型", () => {
    const factory = vi.fn(() => ["1"]);
    const first = resolveDefaultValue(factory);
    const second = resolveDefaultValue(factory);

    expect(factory).toHaveBeenCalledTimes(2);
    expect(first).toEqual(["1"]);
    expect(second).toEqual(["1"]);
    expect(first).not.toBe(second);
  });

  it("解包并克隆响应式默认值", () => {
    const defaultValue = reactive(["1"]);
    const result = resolveDefaultValue(defaultValue);

    expect(result).toEqual(["1"]);
    expect(result).not.toBe(defaultValue);
  });

  it("根据数组子项结构生成完整数据", () => {
    const schema: FormField = {
      type: "array",
      source: ["items"],
      itemSchema: {
        type: "group",
        model: [
          {
            source: ["collapsed"],
            prop: "collapsed",
            defaultValue: () => ["1"],
          },
          { source: ["name"], prop: "name" },
        ],
        fields: [
          {
            type: "object",
            component: "image",
            model: [
              {
                source: ["name"],
                prop: "name",
                defaultValue: "默认名称",
              },
              {
                source: ["profile", "size"],
                prop: "size",
                defaultValue: 50,
              },
              { source: ["__options", "imageSize"], prop: "list", raw: true },
            ],
          },
        ],
      },
    };

    expect(createArrayItemData(schema)).toEqual({
      collapsed: ["1"],
      name: "默认名称",
      profile: { size: 50 },
    });
  });

  it("根据 ui 和 data 路径生成统一记录节点", () => {
    const schema: FormField = {
      type: "array",
      source: ["data"],
      itemSchema: {
        type: "group",
        model: [
          { source: ["ui", "hidden"], prop: "hidden", defaultValue: false },
          { source: ["data", "name"], prop: "name", defaultValue: "默认名称" },
        ],
        fields: [],
      },
    };

    expect(createArrayItemData(schema)).toEqual({
      ui: { hidden: false },
      data: { name: "默认名称" },
    });
  });

  it("每次生成的数据不共享默认值引用", () => {
    const schema: FormField = {
      type: "array",
      source: ["items"],
      itemSchema: {
        type: "group",
        model: {
          source: ["collapsed"],
          prop: "collapsed",
          defaultValue: ["1"],
        },
        fields: [],
      },
    };

    const first = createArrayItemData(schema);
    const second = createArrayItemData(schema);

    expect(first).toEqual(second);
    expect(first.collapsed).not.toBe(second.collapsed);
  });
});
