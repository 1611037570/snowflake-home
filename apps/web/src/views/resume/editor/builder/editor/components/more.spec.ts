import { mount } from "@vue/test-utils";
import { ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import More from "./more.vue";

const emailField = {
  label: "邮箱",
  addable: true,
  model: { source: ["user", "data", "email"], prop: "modelValue" },
};
const wechatField = {
  label: "微信号",
  addable: true,
  model: { source: ["user", "data", "wechat"], prop: "modelValue" },
};

const mountMore = (collapsed: string[], addField = vi.fn()) =>
  mount(More, {
    props: { collapsed },
    slots: { default: "<div data-test='active-field'>已添加字段</div>" },
    global: {
      provide: {
        "df/context": () => ({
          currentForm: ref({ fields: [emailField, wechatField, { label: "姓名" }] }),
          hasFieldData: (field: any) => field.label === wechatField.label,
          addField,
          getFieldDataKey: (field: any) => field.model?.source?.join("."),
        }),
      },
      stubs: { SfIcon: true },
    },
  });

describe("more", () => {
  it("收起时仍展示已添加字段", () => {
    const wrapper = mountMore([]);

    expect(wrapper.find("[data-test='active-field']").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("+ 邮箱");
  });

  it("展开后只展示尚未添加的可添加字段", async () => {
    const addField = vi.fn();
    const wrapper = mountMore(["1"], addField);

    expect(wrapper.text()).toContain("+ 邮箱");
    expect(wrapper.text()).not.toContain("+ 微信号");
    expect(wrapper.text()).not.toContain("+ 姓名");

    const emailButton = wrapper.findAll("button").find((button) => button.text().includes("邮箱"));
    await emailButton?.trigger("click");

    expect(addField).toHaveBeenCalledWith(emailField);
  });
});
