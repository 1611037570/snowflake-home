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
1. 先调用 read_resume_data 读取简历真实数据。
2. 必须调用 propose_resume_diff 生成对标优化后的修改草稿，patch 仅包含变更字段，结构与简历数据一致，不得跳过工具调用。
3. 严格基于简历真实数据，严禁编造任何信息。
4. 将优化说明写入 analysis 字段，标题使用「问题回复」。`,
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
1. 先调用 read_resume_data 读取简历真实数据。
2. 必须调用 propose_resume_diff 生成优化后的修改草稿，patch 仅包含变更字段，结构与简历数据一致，不得跳过工具调用。
3. 保持简历内容真实，不增删、不编造任何信息。
4. 将优化说明写入 analysis 字段，标题使用「问题回复」。`,
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
1. 先调用 read_resume_data 读取简历真实数据，确认目标模块已有内容，避免重复添加。
2. 必须调用 propose_resume_diff 生成修改草稿：patch 仅包含变更字段，在目标模块中新增一条经历，结构与简历数据一致，不得跳过工具调用。
3. 起草内容围绕用户描述的模块与方向展开，突出成果与量化指标，使用专业表达；用户未提供的事实细节以通用示例占位，便于确认后修改为真实信息。
4. 将起草说明写入 analysis 字段，标题使用「问题回复」，提醒用户核对并修改草稿后再用于简历。`,
        userContent: `请帮我生成这段经历：${experienceInfo}`,
      };
    },
  },
};

// 建议操作卡片：点击后进入对应引导流程，由调用方传给 Chat
export const suggestions: SuggestCard[] = [
  {
    icon: "ph:file-plus-duotone",
    title: "AI生成简历",
    desc: "从零生成一段简历经历",
    flow: "resumeCreate",
  },
  {
    icon: "ph:magic-wand-duotone",
    title: "AI优化简历",
    desc: "全面优化简历内容",
    flow: "resumeOptimize",
  },
  {
    icon: "ph:translate-duotone",
    title: "AI简历翻译",
    desc: "将简历翻译成英文或中文",
    flow: "resumeTranslate",
  },
  {
    icon: "ph:target-duotone",
    title: "JD对标优化",
    desc: "根据岗位JD对标优化简历",
    flow: "jdOptimize",
  },
  {
    icon: "ph:hand-waving-duotone",
    title: "打招呼语",
    desc: "将简历转成开场打招呼语",
    flow: "greeting",
  },
  {
    icon: "ph:microphone-duotone",
    title: "面试自我介绍",
    desc: "将简历转成面试口头稿",
    flow: "selfIntro",
  },
];
