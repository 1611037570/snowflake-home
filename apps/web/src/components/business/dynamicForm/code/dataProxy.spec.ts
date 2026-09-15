import { describe, expect, it, vi } from "vitest";
import DataProxy from "./dataProxy";

describe("DataProxy", () => {
  it("通过数组路径上下文读写相对字段", () => {
    const data = {
      education: {
        data: [{ name: "原名称" }],
      },
    };
    const proxy = new DataProxy(data, vi.fn());
    const binding = { source: ["name"], prop: "modelValue" };
    const context = { basePath: ["education", "data"], index: 0 };

    expect(proxy.getDataProxy(binding, context)).toEqual({ modelValue: "原名称" });
    proxy.setDataProxy(binding, context)["update:modelValue"]("新名称");
    expect(data.education.data[0]?.name).toBe("新名称");
  });

  it("通过对象路径上下文读写 data 与 ui", () => {
    const data = {
      user: {
        ui: { hidden: false },
        data: { name: "原名称" },
      },
    };
    const proxy = new DataProxy(data, vi.fn());
    const context = { basePath: ["user"] };

    expect(proxy.getDataProxy({ source: ["data", "name"], prop: "modelValue" }, context)).toEqual({
      modelValue: "原名称",
    });
    proxy.setDataProxy({ source: ["ui", "hidden"], prop: "hidden" }, context)["update:hidden"](
      true,
    );

    expect(data.user.ui.hidden).toBe(true);
  });
});
