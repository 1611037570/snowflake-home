import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { DF_CONTEXT } from "@/components/business/dynamicForm/api";
import More from "./more.vue";

// 可添加字段与真实配置一致：标题由包裹组通过 props 声明
const emailField = {
  addable: true,
  model: { source: ["data", "email"], prop: "modelValue" },
  props: { label: "邮箱" },
};
const wechatField = {
  addable: true,
  model: { source: ["data", "wechat"], prop: "modelValue" },
  props: { label: "微信号" },
};

const mountMore = (collapsed: string[], addField = vi.fn()) =>
  mount(More, {
    props: { collapsed },
    slots: { default: "<div data-test='active-field'>已添加字段</div>" },
    global: {
      // 组件内部读取应用状态，需提供独立的 pinia 实例
      plugins: [createPinia()],
      provide: {
        [DF_CONTEXT]: () => ({
          currentForm: ref({
            fields: [emailField, wechatField, { props: { label: "姓名" } }],
          }),
          hasFieldData: (field: any) => field.props?.label === wechatField.props.label,
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
    expect(wrapper.text()).not.toContain("邮箱");
  });

  it("展开后只展示尚未添加的可添加字段", async () => {
    const addField = vi.fn();
    const wrapper = mountMore(["1"], addField);

    expect(wrapper.text()).toContain("邮箱");
    expect(wrapper.text()).not.toContain("微信号");
    expect(wrapper.text()).not.toContain("姓名");

    const emailButton = wrapper.findAll("button").find((button) => button.text().includes("邮箱"));
    await emailButton?.trigger("click");

    expect(addField).toHaveBeenCalledWith(emailField);
  });
});
