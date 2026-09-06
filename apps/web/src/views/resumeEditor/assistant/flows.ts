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
请将用户的简历数据翻译成英文。
要求：
1. 逐项翻译所有字段内容，保持结构对应，不增删、不改写原意。
2. 专业术语、职位、项目名称使用规范英文表达。
3. 严格基于简历真实数据，严禁编造任何信息。
4. 本次不修改简历内容，data 固定为 null，不直接返回简历数据。
5. 将英文翻译结果写入 analysis 字段，标题使用「问题回复」。`
          : `# 任务：将简历内容翻译成中文
请将用户的简历数据翻译成中文。
要求：
1. 逐项翻译所有字段内容，保持结构对应，不增删、不改写原意。
2. 专业术语、职位、项目名称使用规范中文表达。
3. 严格基于简历真实数据，严禁编造任何信息。
4. 本次不修改简历内容，data 固定为 null，不直接返回简历数据。
5. 将中文翻译结果写入 analysis 字段，标题使用「问题回复」。`,
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
请根据用户的简历数据，撰写一段自然流畅、口语化的面试自我介绍口头稿。
要求：
1. 以第一人称展开，突出核心优势、关键经历与求职意向。
2. 字数控制在 ${wordCount} 左右，风格${style}，适合直接朗读。
3. 严格基于简历真实数据，严禁编造任何信息。
4. 本次不修改简历内容，data 固定为 null，不直接返回简历数据。
5. 将自我介绍口头稿写入 analysis 字段，标题使用「问题回复」。`,
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
请根据用户的简历数据，撰写一段面试开场时的打招呼语。
要求：
1. 以第一人称展开，先礼貌问候，再简要介绍身份与求职意向。
2. 风格${style}，语言自然流畅，适合开场直接说出。
3. 严格基于简历真实数据，严禁编造任何信息。
4. 本次不修改简历内容，data 固定为 null，不直接返回简历数据。
5. 将打招呼语写入 analysis 字段，标题使用「问题回复」。`,
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

请基于该 JD 对用户简历进行对标优化。
要求：
1. 必须调用 propose_resume_edits，通过 operations 语义化提交对标优化修改（update 指定 module，数组模块带 index），不得跳过工具调用。
2. 严格基于简历真实数据，严禁编造任何信息。
3. 将优化说明写入 analysis 字段，标题使用「问题回复」。`,
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
请根据用户的简历数据，从${direction}方向进行全面优化。
要求：
1. 必须调用 propose_resume_edits，通过 operations 语义化提交优化修改（update 指定 module，数组模块带 index），不得跳过工具调用。
2. 保持简历内容真实，不增删、不编造任何信息。
3. 将优化说明写入 analysis 字段，标题使用「问题回复」。`,
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

请基于该描述为对应的简历模块从零起草一段经历（用于模块开荒起步）。
要求：
1. 确认目标模块已有内容，避免重复添加。
2. 必须调用 propose_resume_edits：数组型模块用 op: add 新增记录并携带起草内容（record），对象型模块用 update 写入字段；新增记录会同步出现在表单与预览中，不得跳过工具调用。
3. 起草内容围绕用户描述的模块与方向展开，突出成果与量化指标，使用专业表达；用户未提供的事实细节以通用示例占位，便于确认后修改为真实信息。
4. 将起草说明写入 analysis 字段，标题使用「问题回复」，提醒用户核对并修改草稿后再用于简历。`,
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
请根据用户的简历数据，以资深面试官的身份开展技术基础类模拟面试。
要求：
1. 依据求职岗位与简历中的技能栈设计题目。
2. 每次只提出一个面试问题，围绕该岗位核心基础知识与原理逐题考察，从易到难，符合真实面试节奏。
3. 用户回答后先简短反馈，再继续追问或换题考察；回答有遗漏时提示补充；用户提出结束或索要参考答案时，再点评回答并给出完整参考答案与答题思路。
4. 严格基于简历真实数据，严禁编造任何信息。
5. 本次不修改简历内容，data 固定为 null，不直接返回简历数据。
6. 将本轮面试问题写入 analysis 字段，标题使用「问题回复」。`
          : `# 任务：AI 模拟面试（项目深挖方向）
请根据用户的简历数据，以资深面试官的身份开展项目经历深挖类模拟面试。
要求：
1. 聚焦用户的工作经历与项目经历设计问题。
2. 每次只提出一个面试问题，围绕项目背景、个人职责、技术选型、难点攻坚、量化结果与复盘反思逐层深挖，符合真实面试节奏。
3. 用户回答后先简短反馈，再继续追问或转换考察角度；用户提出结束或索要参考答案时，再点评回答并给出答题思路。
4. 严格基于简历真实数据，严禁编造任何信息。
5. 本次不修改简历内容，data 固定为 null，不直接返回简历数据。
6. 将本轮面试问题写入 analysis 字段，标题使用「问题回复」。`,
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
请根据用户的简历数据，从资深 HR 视角进行综合评估。
要求：
1. 从简历完整度、结构排版、内容质量（成果量化、STAR 表达）、语言表达、岗位匹配度等维度逐项评估。
2. 给出百分制总分与各分项得分，说明评分依据，列出主要扣分点，并给出可执行的改进建议。
3. 严格基于简历真实数据，严禁编造任何信息；简历未体现的维度按缺失评估并给出补强方向。
4. 本次不修改简历内容，data 固定为 null，不直接返回简历数据。
5. 将打分结果与改进建议写入 analysis 字段，标题使用「问题回复」。`,
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
