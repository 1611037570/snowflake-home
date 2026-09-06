// 引导式 AI 流程配置：点击建议卡片后，先通过预设问答收集信息，再发起真实请求
import type { Flow, SuggestCard } from "./types";

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
      const isZhToEn = direction === "中译英";
      return {
        prompt: isZhToEn
          ? `# 任务：将简历内容翻译成英文
逐项翻译用户简历的所有字段内容，保持结构对应，不增删、不改写原意；专业术语、职位、项目名称使用规范英文表达。`
          : `# 任务：将简历内容翻译成中文
逐项翻译用户简历的所有字段内容，保持结构对应，不增删、不改写原意；专业术语、职位、项目名称使用规范中文表达。`,
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
      return {
        prompt: `# 任务：生成面试自我介绍口头稿
以第一人称撰写一段自然流畅、口语化的自我介绍，突出核心优势、关键经历与求职意向；字数约 ${wordCount}，风格${style}，适合直接朗读。`,
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
      return {
        prompt: `# 任务：生成面试开场打招呼语
以第一人称撰写一段开场打招呼语：先礼貌问候，再简要介绍身份与求职意向；风格${style}，语言自然流畅，适合开场直接说出。`,
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
      return {
        prompt: `# 任务：JD 对标优化简历
目标岗位 JD 内容如下：
${jd}

请基于该 JD 对用户简历进行对标优化并提交修改。`,
        userContent: `请根据我提供的 JD 内容，对标优化我的简历`,
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
      return {
        prompt: `# 任务：优化简历
请从${direction}方向优化用户简历，保持内容真实，不增删、不编造任何信息。`,
        userContent: `请帮我优化简历，侧重${direction}`,
      };
    },
  },
  // AI生成简历：按用户描述为指定模块从零起草一段经历，供开荒起步
  resumeCreate: {
    userContent: "帮我从零生成一段简历经历",
    steps: [
      {
        question:
          "请描述你想为哪个模块生成经历及大致方向（例如：生成一段产品经理的工作经历、生成一段 Vue 后台的项目经历）",
        options: [],
        input: true,
      },
    ],
    build: ([experienceInfo]) => {
      return {
        prompt: `# 任务：从零生成简历经历
用户想生成的经历描述如下：
${experienceInfo}

请基于该描述在对应简历模块起草一段经历（用于模块开荒起步）：先确认目标模块已有内容，避免重复添加；内容围绕用户描述的模块与方向展开，突出成果与量化指标，使用专业表达；用户未提供的事实细节用通用示例占位，便于核对后修改为真实信息；写入后提醒用户可在编辑器中核对或撤销。`,
        userContent: `请帮我生成这段经历：${experienceInfo}`,
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
      // 根据所选方向输出对应考察内容的面试提示
      const isBasics = direction === "八股文";
      return {
        prompt: isBasics
          ? `# 任务：AI 模拟面试（八股文方向）
以资深面试官身份开展技术基础类模拟面试：依据求职岗位与简历技能栈出题，每次只问一个问题，从易到难；用户回答后先简短反馈，再追问或换题，回答有遗漏时提示补充；用户要求结束时再点评并给出完整参考答案。`
          : `# 任务：AI 模拟面试（项目深挖方向）
以资深面试官身份开展项目经历深挖类模拟面试：聚焦工作与项目经历，每次只问一个问题，围绕背景、职责、技术选型、难点攻坚、量化结果与复盘逐层深挖；用户回答后先简短反馈再继续追问；用户要求结束时再点评并给出答题思路。`,
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
      prompt: `# 任务：AI 简历打分
以资深 HR 视角从完整度、结构排版、内容质量（成果量化、STAR 表达）、语言表达、岗位匹配度等维度评估简历：给出百分制总分与分项得分、评分依据、主要扣分点与可执行改进建议；简历未体现的维度按缺失评估并给出补强方向。`,
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
