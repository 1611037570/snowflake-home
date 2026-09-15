import { describe, expect, it } from "vitest";
import type { FormField } from "@/components/business/dynamicForm/types";
import { buildResumeSchema, getResumeModuleSchema } from "./resumeSchema";

describe("resumeSchema", () => {
  it("从对象模块解析字段属性和字典选项", () => {
    const user: FormField[] = [
      {
        type: "group",
        key: "user",
        context: ["user"],
        model: { source: ["ui", "title"], prop: "title", defaultValue: "个人信息" },
        fields: [
          {
            type: "object",
            component: "select",
            label: "求职状态",
            addable: true,
            model: [
              { source: ["data", "status"], prop: "modelValue" },
              { source: ["__options", "status"], prop: "list", raw: true },
            ],
          },
        ],
      },
    ];

    const [module] = buildResumeSchema([{ key: "user", schema: user }], {
      status: [{ name: "在职", value: "在职" }],
    });

    expect(module).toMatchObject({ key: "user", title: "个人信息", kind: "object" });
    expect(module?.fields[0]).toMatchObject({
      key: "status",
      label: "求职状态",
      valueType: "string",
      addable: true,
      options: ["在职"],
    });
  });

  it("从数组容器解析记录相对字段和继承必填规则", () => {
    const work: FormField = {
      type: "group",
      key: "work",
      context: ["work"],
      fields: [
        {
          type: "array",
          source: ["data"],
          itemSchema: {
            type: "group",
            required: true,
            fields: [
              {
                type: "object",
                component: "datePicker",
                label: "时间",
                props: { type: "monthrange" },
                model: { source: ["data", "time"], prop: "modelValue" },
              },
            ],
          },
        },
      ],
    };

    const schema = buildResumeSchema([{ key: "work", schema: work }]);

    expect(schema[0]).toMatchObject({ kind: "array", dataPath: ["data"] });
    expect(schema[0]?.fields[0]).toMatchObject({
      key: "time",
      path: ["data", "time"],
      valueType: "array",
      required: true,
      format: "monthRange",
    });
  });

  it("动态自定义模块复用自定义结构", () => {
    const schema = buildResumeSchema([{ key: "custom", schema: { type: "group", fields: [] } }]);

    expect(getResumeModuleSchema(schema, "custom_abcd")?.key).toBe("custom");
  });
});
