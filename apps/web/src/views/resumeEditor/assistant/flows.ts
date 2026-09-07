// 引导式 AI 流程配置：点击建议卡片后，先通过预设问答收集信息，再发起真实请求
import { useResumeStore } from "@/stores";
import { DEFAULT_MODULE_NAMES } from "@/stores/modules/resume/defaultConfig";
import type { Flow, SuggestCard } from "./types";

// 获取可作为 AI 生成经历的已有模块名：过滤用户信息与社交账号，内置模块按默认顺序展示
const getResumeCreateModuleOptions = (): string[] => {
  const resumeStore = useResumeStore();
  const data = resumeStore.currentData;
  if (!data) return [];
  const builtinOrder = new Map(DEFAULT_MODULE_NAMES.map((item, index) => [item.key, index]));
  return Object.keys(data)
    .filter((key) => key !== "user" && key !== "account")
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
        question: "请问你需要哪种翻译方向？",
        options: ["中译英", "英译中"],
      },
    ],
    build: ([direction]) => {
      // 翻译任务规范已抽离为技能，由模型按需加载；此处仅把翻译方向带进真实请求
      const isZhToEn = direction === "中译英";
      return {
        userContent: isZhToEn ? "请将我的简历内容翻译成英文" : "请将我的简历内容翻译成中文",
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
  // JD 对标优化：等用户在输入框输入 JD 后执行对标优化
  jdOptimize: {
    userContent: "帮我进行JD对标优化",
    steps: [
      {
        question: "请在输入框中粘贴目标岗位的 JD 内容并发送，我将基于它对标优化你的简历",
        options: [],
        input: true,
      },
    ],
    build: ([jd]) => {
      // JD 对标统一走 jobMatch 技能，由模型按需加载；JD 原文随用户消息传递
      return {
        userContent: `请根据我提供的以下目标岗位 JD 内容，对标优化我的简历：\n\n${jd}`,
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
    ],
    build: ([direction]) => {
      // 任务规范已抽离为 resumeInterview 技能，由模型按需加载；此处仅携带考察方向
      return {
        userContent: `请根据我的简历进行${direction}方向的模拟面试`,
      };
    },
  },
  // AI 简历打分：确认开始后，从多个维度评估简历并给出改进建议
  resumeScore: {
    userContent: "帮我进行AI简历打分",
    steps: [
      {
        question: "请确认开始打分：我会先阅读你的简历，再从完整度、量化成果、语言表达与岗位匹配等维度综合评估。",
        options: ["开始打分"],
      },
    ],
    build: () => ({
      // 任务规范已抽离为 resumeScore 技能，由模型按需加载
      userContent: "请根据我的简历进行综合打分并给出改进建议",
    }),
  },
};

// 建议操作卡片：点击后进入对应引导流程，由调用方传给 Chat
export const suggestions: SuggestCard[] = [
  {
    icon: "ph:file-plus-duotone",
    title: "AI生成简历",
    flow: "resumeCreate",
  },
  {
    icon: "ph:magic-wand-duotone",
    title: "AI优化简历",
    flow: "resumeOptimize",
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
    icon: "ph:chats-teardrop-duotone",
    title: "AI简历面试",
    flow: "resumeInterview",
  },
  {
    icon: "ph:star-duotone",
    title: "AI简历打分",
    flow: "resumeScore",
  },
];
