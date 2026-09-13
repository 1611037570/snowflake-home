import type { SuggestCard } from "../types";

// 面试域入口独立配置，当前由简历助手的面试分类展示
export const interviewSuggestions: SuggestCard[] = [
  {
    icon: "ph:microphone-duotone",
    title: "面试自我介绍",
    flow: "selfIntro",
    category: "interview",
  },
  {
    icon: "ph:crosshair-duotone",
    title: "面试押题",
    flow: "interviewPrediction",
    category: "interview",
    intro: {
      duration: "3-5 分钟快速生成 · 命中率 80%+",
      description:
        "基于岗位 JD 和个人简历，AI 智能分析并预测高频面试题，提供参考答案与回答技巧，得到专业反馈报告。",
      features: [
        "智能分析岗位 JD，精准匹配技能要求",
        "覆盖技术、项目、行为等多维度题型",
        "附带高分参考答案与 STAR 回答框架",
      ],
      scene: "面试前快速准备",
      action: "开始面试押题",
    },
  },
  {
    icon: "ph:microphone-stage-duotone",
    title: "专项面试模拟",
    flow: "specializedInterview",
    category: "interview",
    intro: {
      badge: "🔥 最受欢迎",
      duration: "约 1 小时 · 支持语音/文字多模态",
      description:
        "针对技术面、业务面进行深度 1v1 模拟，AI 面试官实时追问与反馈，全面提升实战能力。",
      features: [
        "真实面试场景 1v1 对话模拟",
        "AI 智能追问，深度挖掘技术能力",
        "多轮问答评估，即时反馈与打分",
      ],
      scene: "深度实战训练",
      action: "开始专项模拟",
    },
  },
  {
    icon: "ph:exam-duotone",
    title: "行测 + HR 面试",
    flow: "aptitudeHrInterview",
    category: "interview",
    intro: {
      badge: "综合评估",
      duration: "约 45 分钟 · 双重评估维度",
      description:
        "覆盖行政能力测试 + HR 软技能面试，全面评估综合素质与软实力表现，大幅提升入职率。",
      features: [
        "行测题库与限时模拟测试",
        "HR 面试软技能深度评估",
        "沟通表达与情商能力评测反馈",
      ],
      scene: "全面能力提升",
      action: "开始综合评估",
    },
  },
  {
    icon: "ph:chats-teardrop-duotone",
    title: "AI简历面试",
    flow: "resumeInterview",
    category: "interview",
  },
];
