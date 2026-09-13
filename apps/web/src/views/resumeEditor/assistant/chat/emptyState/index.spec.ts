import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import EmptyState from "./index.vue";

vi.mock("@/stores/modules/resume/defaultConfig", () => ({
  ALL_MODULE_KEY: "all",
}));

vi.mock("./oneVOne.vue", () => ({
  default: { template: "<div />" },
}));

const suggestions = [
  { icon: "ph:rocket-launch-duotone", title: "一键优化", flow: "oneKeyOptimize" },
  { icon: "ph:magic-wand-duotone", title: "简历优化", flow: "resumeOptimize" },
  {
    icon: "ph:crosshair-duotone",
    title: "面试押题",
    flow: "interviewPrediction",
    intro: {
      duration: "3-5 分钟快速生成 · 命中率 80%+",
      description: "基于岗位 JD 和个人简历预测高频面试题。",
      features: ["覆盖技术、项目、行为等多维度题型"],
      scene: "面试前快速准备",
      action: "开始面试押题",
    },
  },
];

const mountEmptyState = () =>
  mount(EmptyState, {
    props: { suggestions },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        SfIcon: true,
        SfButton: {
          emits: ["click"],
          template: '<button @click="$emit(\'click\')"><slot /></button>',
        },
        SfModal: {
          props: ["modelValue"],
          template: '<div v-if="modelValue" data-test="modal"><slot /></div>',
        },
      },
    },
  });

describe("oneKeyOptimizeIntro", () => {
  it("点击一键优化时先展示功能介绍", async () => {
    const wrapper = mountEmptyState();
    const entry = wrapper.findAll("button").find((button) => button.text() === "一键优化")!;

    await entry.trigger("click");

    expect(wrapper.find('[data-test="modal"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("全方位诊断");
    expect(wrapper.text()).toContain("智能优化");
    expect(wrapper.text()).toContain("必要增删");
    expect(wrapper.text()).toContain("优化报告");
    expect(wrapper.emitted("suggest")).toBeUndefined();
  });

  it("确认后才启动原有一键优化流程", async () => {
    const wrapper = mountEmptyState();
    const entry = wrapper.findAll("button").find((button) => button.text() === "一键优化")!;
    await entry.trigger("click");

    // 确认按钮只负责衔接既有流程，授权与信息收集仍由上层处理
    const confirm = wrapper
      .findAll("button")
      .find((button) => button.text() === "开始一键优化")!;
    await confirm.trigger("click");

    expect(wrapper.emitted("suggest")).toEqual([[{ flow: "oneKeyOptimize" }]]);
    expect(wrapper.find('[data-test="modal"]').exists()).toBe(false);
  });
});

describe("featureIntro", () => {
  it("面试押题先展示功能介绍再启动流程", async () => {
    const wrapper = mountEmptyState();
    const entry = wrapper.findAll("button").find((button) => button.text() === "面试押题")!;

    await entry.trigger("click");

    expect(wrapper.text()).toContain("3-5 分钟快速生成 · 命中率 80%+");
    expect(wrapper.text()).toContain("覆盖技术、项目、行为等多维度题型");
    expect(wrapper.emitted("suggest")).toBeUndefined();

    const confirm = wrapper
      .findAll("button")
      .find((button) => button.text() === "开始面试押题")!;
    await confirm.trigger("click");

    expect(wrapper.emitted("suggest")).toEqual([[{ flow: "interviewPrediction" }]]);
  });
});
