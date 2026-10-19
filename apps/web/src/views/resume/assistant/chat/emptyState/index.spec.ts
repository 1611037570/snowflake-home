import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import EmptyState from "./index.vue";

vi.mock("@/stores/modules/resume/config/defaultConfig", () => ({
  ALL_MODULE_KEY: "all",
}));

vi.mock("./oneVOne.vue", () => ({
  default: { template: "<div />" },
}));

const suggestions = [
  {
    icon: "ph:rocket-launch-duotone",
    title: "一键优化",
    flow: "oneKeyOptimize",
    category: "resume" as const,
  },
  {
    icon: "ph:magic-wand-duotone",
    title: "简历优化",
    flow: "resumeOptimize",
    category: "resume" as const,
  },
  {
    icon: "ph:crosshair-duotone",
    title: "面试押题",
    flow: "interviewPrediction",
    category: "interview" as const,
    intro: {
      duration: "3-5 分钟快速生成 · 命中率 80%+",
      description: "基于岗位 JD 和个人简历预测高频面试题。",
      features: ["覆盖技术、项目、行为等多维度题型"],
      scene: "面试前快速准备",
      action: "开始面试押题",
    },
  },
  {
    icon: "ph:microphone-stage-duotone",
    title: "专项面试模拟",
    flow: "specializedInterview",
    category: "interview" as const,
    intro: {
      badge: "🔥 最受欢迎",
      duration: "约 1 小时 · 支持语音/文字多模态",
      description: "针对技术面、业务面进行深度 1v1 模拟。",
      features: ["多轮问答评估，即时反馈与打分"],
      scene: "深度实战训练",
      action: "开始专项模拟",
    },
  },
  {
    icon: "ph:exam-duotone",
    title: "行测 + HR 面试",
    flow: "aptitudeHrInterview",
    category: "interview" as const,
    intro: {
      badge: "综合评估",
      duration: "约 45 分钟 · 双重评估维度",
      description: "覆盖行政能力测试 + HR 软技能面试。",
      features: ["沟通表达与情商能力评测反馈"],
      scene: "全面能力提升",
      action: "开始综合评估",
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
        // 分类切换用按钮渲染，便于按标题点击切换
        SfTab: {
          props: ["list", "modelValue"],
          emits: ["update:modelValue"],
          template: `<div>
            <button
              v-for="item in list"
              :key="item.value"
              @click="$emit('update:modelValue', item.value)"
            >{{ item.name }}</button>
          </div>`,
        },
      },
    },
  });

// 面试相关用例先切换到次级分类，默认入口仍验证简历工具
const showInterviewSuggestions = async (wrapper: ReturnType<typeof mountEmptyState>) => {
  const category = wrapper.findAll("button").find((button) => button.text() === "面试训练")!;
  await category.trigger("click");
};

describe("suggestionCategory", () => {
  it("默认只展示简历工具，切换后展示面试训练", async () => {
    const wrapper = mountEmptyState();

    expect(wrapper.text()).toContain("简历优化");
    expect(wrapper.text()).not.toContain("面试押题");

    await showInterviewSuggestions(wrapper);

    expect(wrapper.text()).toContain("面试押题");
    expect(wrapper.text()).not.toContain("简历优化");
    expect(wrapper.text()).toContain("基于你的简历开展岗位准备与模拟训练");
  });
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
    await showInterviewSuggestions(wrapper);
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

  it("专项面试模拟展示热门标识并启动对应流程", async () => {
    const wrapper = mountEmptyState();
    await showInterviewSuggestions(wrapper);
    const entry = wrapper.findAll("button").find((button) => button.text() === "专项面试模拟")!;

    await entry.trigger("click");

    expect(wrapper.text()).toContain("🔥 最受欢迎");
    expect(wrapper.text()).toContain("约 1 小时 · 支持语音/文字多模态");

    const confirm = wrapper.findAll("button").find((button) => button.text() === "开始专项模拟")!;
    await confirm.trigger("click");

    expect(wrapper.emitted("suggest")).toEqual([[{ flow: "specializedInterview" }]]);
  });

  it("行测与 HR 面试展示综合评估介绍并启动流程", async () => {
    const wrapper = mountEmptyState();
    await showInterviewSuggestions(wrapper);
    const entry = wrapper.findAll("button").find((button) => button.text() === "行测 + HR 面试")!;

    await entry.trigger("click");

    expect(wrapper.text()).toContain("综合评估");
    expect(wrapper.text()).toContain("约 45 分钟 · 双重评估维度");

    const confirm = wrapper.findAll("button").find((button) => button.text() === "开始综合评估")!;
    await confirm.trigger("click");

    expect(wrapper.emitted("suggest")).toEqual([[{ flow: "aptitudeHrInterview" }]]);
  });
});
