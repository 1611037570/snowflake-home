// 引导式 AI 流程配置：点击建议卡片后，先通过预设问答收集信息，再发起真实请求
import { useResumeStore } from "@/stores";
import { DEFAULT_MODULE_NAMES } from "@/stores/modules/resume/defaultConfig";
import type { Flow, SuggestCard } from "./types";

// 获取可作为 AI 生成经历的已有模块名：过滤个人信息与社交账号，内置模块按默认顺序展示
const getResumeCreateModuleOptions = (): string[] => {
  const resumeStore = useResumeStore();
  const data = resumeStore.currentData;
  if (!data) return [];
  const builtinOrder = new Map(DEFAULT_MODULE_NAMES.map((item, index) => [item.key, index]));
  return Object.keys(data)
    .filter((key) => key !== "user")
    .sort((a, b) => {
      const orderA = builtinOrder.get(a) ?? Number.MAX_SAFE_INTEGER;
      const orderB = builtinOrder.get(b) ?? Number.MAX_SAFE_INTEGER;
      return orderA === orderB ? a.localeCompare(b) : orderA - orderB;
    })
    .map((key) => resumeStore.getModel(key)?.name || key)
    .filter(Boolean);
};

export const flows: Record<string, Flow> = {
  // 简历翻译：先选择翻译方向，再执行
  resumeTranslate: {
    userContent: "帮我进行简历翻译",
    steps: [
      {
        question: "请问你需要翻译成哪种语言？",
        options: ["中文", "英语", "日语", "韩语", "法语", "德语", "西班牙语", "俄语"],
      },
    ],
    build: ([language]) => {
      // 翻译任务规范已抽离为技能，由模型按需加载；此处仅携带目标语言
      return {
        userContent: `请将我的简历内容翻译成${language}并更新到简历`,
      };
    },
  },
  // 面试自我介绍：先选择字数，再选择风格，最后执行
  selfIntro: {
    userContent: "帮我生成面试自我介绍",
    steps: [
      {
        question: "请问自我介绍的字数大概多少？",
        options: ["100字", "200字", "300字"],
      },
      {
        question: "请问你希望用什么风格？",
        options: ["简洁", "专业", "热情"],
      },
    ],
    build: ([wordCount, style]) => {
      // 任务规范已抽离为 selfIntro 技能，由模型按需加载；此处仅携带字数与风格参数
      return {
        userContent: `请根据我的简历，生成一段${style}风格、约${wordCount}的面试自我介绍口头稿`,
        // 自我介绍需要综合完整经历，本次请求固定读取整份简历
        requestContext: { resumeScope: "all" },
      };
    },
  },
  // 打招呼语：先选择风格，再执行
  greeting: {
    userContent: "帮我生成打招呼语",
    steps: [
      {
        question: "请问你希望用什么风格？",
        options: ["正式", "亲切", "幽默"],
      },
    ],
    build: ([style]) => {
      // 任务规范已抽离为 greeting 技能，由模型按需加载；此处仅携带风格参数
      return {
        userContent: `请根据我的简历，生成一段${style}风格的开场打招呼语`,
      };
    },
  },
  // 面试押题：收集目标岗位 JD 后，结合整份简历生成高频问题与准备反馈
  interviewPrediction: {
    userContent: "帮我进行面试押题",
    steps: [
      {
        question: "请在输入框中粘贴目标岗位的 JD 内容并发送",
        options: [],
        input: true,
      },
    ],
    build: ([jd]) => ({
      userContent: `请基于我的整份简历和以下目标岗位 JD 进行面试押题，覆盖技术或专业、项目或经历、行为题，并提供参考答案、回答技巧与准备反馈报告。\n\n<job_description>\n${jd}\n</job_description>`,
      // 面试押题需要对照完整经历与岗位要求，本次请求固定读取整份简历
      requestContext: { resumeScope: "all" },
    }),
  },
  // 专项面试模拟：选择技术面或业务面后，基于整份简历开展逐轮追问与评分
  specializedInterview: {
    userContent: "帮我进行专项面试模拟",
    steps: [
      {
        question: "请选择本次专项模拟的面试方向",
        options: ["技术面", "业务面"],
      },
    ],
    build: ([direction]) => ({
      userContent: `请根据我的整份简历开展${direction}专项面试模拟。请保持真实面试官角色，每轮只问一个问题；我回答后先针对本轮表现给出十分制评分、反馈与回答技巧，再结合回答继续追问。`,
      // 专项模拟需要持续核对完整经历，本次请求固定读取整份简历
      requestContext: { resumeScope: "all" },
    }),
  },
  // 行测与 HR 面试：确认后依次开展限时行测、软技能面试与综合评估
  aptitudeHrInterview: {
    userContent: "帮我进行行测和 HR 面试综合评估",
    steps: [
      {
        question: "本次评估约 45 分钟，将依次进行行测与 HR 面试，请确认是否开始",
        options: ["开始综合评估"],
      },
    ],
    build: () => ({
      userContent:
        "请根据我的整份简历开展行测与 HR 面试综合评估：先进行带建议时限的行测模拟，再进行 HR 软技能面试；每轮只出一道题并等待我回答，完成两个阶段后输出综合评分与反馈报告。",
      // HR 评估需要核对完整经历，行测与面试共用本次整份简历上下文
      requestContext: { resumeScope: "all" },
    }),
  },
  // JD 对标优化：等用户在输入框输入 JD 后执行对标优化
  jdOptimize: {
    userContent: "帮我进行JD对标优化",
    steps: [
      {
        question: "请问你希望怎么处理这份 JD？",
        options: ["只给匹配分析，暂不改简历", "分析并直接优化写入"],
      },
      {
        question: "请在输入框中粘贴目标岗位的 JD 内容并发送",
        options: [],
        input: true,
      },
    ],
    build: ([mode, jd]) => {
      // JD 对标统一走 jobMatch 技能，由模型按需加载；此处携带处理模式与 JD 原文
      const onlyAnalyze = mode === "只给匹配分析，暂不改简历";
      return {
        userContent: onlyAnalyze
          ? `请根据我提供的以下目标岗位 JD 内容，对我的简历做匹配分析（只给分析结论与补强方向，不改动简历）：\n\n${jd}`
          : `请根据我提供的以下目标岗位 JD 内容，对标优化我的简历并写入修改：\n\n${jd}`,
      };
    },
  },
  // 简历优化：先选择优化方向，再执行
  resumeOptimize: {
    userContent: "帮我优化简历",
    steps: [
      {
        question: "请问你希望从哪个方向优化简历？",
        options: ["整体结构", "语言表达", "内容润色"],
      },
    ],
    build: ([direction]) => {
      // 简历优化统一走 resumeOptimization 技能，由模型按需加载；此处仅携带优化方向
      return {
        userContent: `请帮我优化简历，侧重${direction}`,
      };
    },
  },
  // AI生成简历：按用户描述为指定模块从零起草一段经历，供开荒起步
  resumeCreate: {
    userContent: "帮我从零生成一段简历经历",
    steps: [
      {
        question: "请选择要为哪个模块生成经历",
        options: getResumeCreateModuleOptions,
      },
      {
        question: "请描述这段经历的大致方向与内容要点（例如：产品经理，负责官网重构）",
        options: [],
        input: true,
      },
    ],
    build: ([moduleName, direction]) => {
      // 任务规范已抽离为 resumeCreate 技能，由模型按需加载；此处携带所选模块与方向描述
      return {
        userContent: `请帮我生成这段${moduleName}：${direction}`,
      };
    },
  },
  // AI 简历面试：先选择考察方向（八股文或项目深挖），再按方向开展模拟面试
  resumeInterview: {
    userContent: "帮我进行AI简历面试",
    steps: [
      {
        question: "请问你希望模拟面试重点考察哪个方向？",
        options: ["八股文", "项目深挖"],
      },
      {
        question: "每次回答后希望得到什么反馈？",
        options: ["打分并给改进建议", "只继续追问"],
      },
    ],
    build: ([direction, feedback]) => {
      // 任务规范已抽离为 resumeInterview 技能，由模型按需加载；此处携带考察方向与反馈模式
      const withScore = feedback === "打分并给改进建议";
      return {
        userContent: withScore
          ? `请根据我的简历进行${direction}方向的模拟面试，每次只问一个问题，等我回答后再继续追问；每次我回答后先针对回复打分并给改进建议，再问下一题`
          : `请根据我的简历进行${direction}方向的模拟面试，每次只问一个问题，等我回答后再继续追问`,
        // 模拟面试需要从完整经历持续选题，本次请求固定读取整份简历
        requestContext: { resumeScope: "all" },
      };
    },
  },
  // AI 简历评估：体检 + 打分，确认后综合评估简历
  resumeScore: {
    userContent: "帮我进行AI简历评估",
    steps: [
      {
        question: "请确认开始综合评估？",
        options: ["开始评估"],
      },
    ],
    build: () => ({
      // 任务规范已抽离为 resumeScore 技能，由模型按需加载
      userContent: "请根据我的简历进行综合评估：先体检并列出问题清单，再打分并给出改进建议",
      // 综合评估必须覆盖全部模块，本次请求固定读取整份简历
      requestContext: { resumeScope: "all" },
    }),
  },
  // 职业规划：根据简历中的所有经历生成职业规划
  careerPlanning: {
    userContent: "帮我生成职业规划",
    steps: [],
    build: () => ({
      userContent: "请根据我的所有经历生成职业规划",
      // 职业规划依赖完整经历链，本次请求固定读取整份简历
      requestContext: { resumeScope: "all" },
    }),
  },
  // 人生总结：根据简历中的所有经历生成人生总结
  lifeSummary: {
    userContent: "帮我生成人生总结",
    steps: [],
    build: () => ({
      userContent: "请根据我的所有经历生成人生总结",
      // 人生总结依赖完整时间线，本次请求固定读取整份简历
      requestContext: { resumeScope: "all" },
    }),
  },
  // 一键优化：先收集求职方向（已填则确认、未填则输入）与身份，再发起完整优化并产出报告
  oneKeyOptimize: {
    userContent: "帮我进行一键优化",
    steps: [
      {
        question: "一键优化需要读取整份简历，当前只选择了部分模块，是否授权本次读取整份简历？",
        options: ["授权读取并继续", "拒绝并取消"],
        // 仅局部模块模式需要额外授权，整个简历模式直接进入优化信息收集
        when: () => useResumeStore().selectedModule.length > 0,
        cancelAnswers: ["拒绝并取消"],
        cancelMessage: "已取消一键优化，未发起 AI 请求。",
        collectAnswer: false,
      },
      {
        question: "请确认或填写你的求职方向（例如：金融分析师、后端开发）",
        // 求职方向已在简历中填写时以该值作为确认选项；未填写时返回空选项回退为自由输入
        options: () => {
          const position = useResumeStore().currentData?.user?.data?.position?.trim();
          return position ? [position] : [];
        },
      },
      {
        question: "请选择你的身份",
        options: ["学生", "职场人"],
      },
    ],
    build: ([direction, identity]) => {
      // 一键优化规范已抽离为 resumeOneKeyOptimize 技能，由模型按需加载；此处携带求职方向与身份参数
      return {
        userContent: `请对我的简历进行一键优化：求职方向为「${direction}」，身份为「${identity}」。请补齐缺失经历、综合优化内容，并给出评分与优化报告。`,
        // 用户已处于整个简历模式或在流程中明确授权，本次请求固定读取整份简历
        requestContext: { resumeScope: "all" },
      };
    },
  },
};

// 建议操作卡片：点击后进入对应引导流程，由调用方传给 Chat
export const suggestions: SuggestCard[] = [
  {
    icon: "ph:file-plus-duotone",
    title: "AI简历生成",
    flow: "resumeCreate",
  },
  {
    icon: "ph:magic-wand-duotone",
    title: "AI简历优化",
    flow: "resumeOptimize",
  },
  {
    icon: "ph:rocket-launch-duotone",
    title: "一键优化",
    flow: "oneKeyOptimize",
  },
  {
    icon: "ph:translate-duotone",
    title: "AI简历翻译",
    flow: "resumeTranslate",
  },
  {
    icon: "ph:target-duotone",
    title: "JD对标优化",
    flow: "jdOptimize",
  },
  {
    icon: "ph:hand-waving-duotone",
    title: "打招呼语",
    flow: "greeting",
  },
  {
    icon: "ph:microphone-duotone",
    title: "面试自我介绍",
    flow: "selfIntro",
  },
  {
    icon: "ph:crosshair-duotone",
    title: "面试押题",
    flow: "interviewPrediction",
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
  },
  {
    icon: "ph:star-duotone",
    title: "AI简历评估",
    flow: "resumeScore",
  },
  {
    icon: "ph:briefcase-duotone",
    title: "职业规划",
    flow: "careerPlanning",
  },
  {
    icon: "ph:user-duotone",
    title: "人生总结",
    flow: "lifeSummary",
  },
];
