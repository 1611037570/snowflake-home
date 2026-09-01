// 引导式 AI 流程配置：点击建议卡片后，先通过预设问答收集信息，再发起真实请求

export type FlowStep = {
  // 询问文案
  question: string;
  // 选项按钮
  options: string[];
  // 自由输入：等待用户在输入框输入文本作为答案
  input?: boolean;
};

export type Flow = {
  // 点击卡片后展示的用户消息
  userContent: string;
  // 引导步骤
  steps: FlowStep[];
  // 复杂任务标记：react 表示走 ReAct 循环，其余走单轮问答
  mode?: "react";
  // 收集完成后的真实请求构造
  build: (answers: string[]) => { prompt?: string; userContent: string };
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
      const isZhToEn = direction === "中译英";
      return {
        prompt: isZhToEn
          ? `# 任务：将简历内容翻译成英文
请将用户的简历数据翻译成英文。
要求：
1. 逐项翻译所有字段内容，保持结构对应，不增删、不改写原意。
2. 专业术语、职位、项目名称使用规范英文表达。
3. 严格基于简历真实数据，严禁编造任何信息。
4. 本次不修改简历内容，data 字段原样返回。
5. 将英文翻译结果写入 analysis 字段，标题使用「问题回复」。`
          : `# 任务：将简历内容翻译成中文
请将用户的简历数据翻译成中文。
要求：
1. 逐项翻译所有字段内容，保持结构对应，不增删、不改写原意。
2. 专业术语、职位、项目名称使用规范中文表达。
3. 严格基于简历真实数据，严禁编造任何信息。
4. 本次不修改简历内容，data 字段原样返回。
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
4. 本次不修改简历内容，data 字段原样返回。
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
4. 本次不修改简历内容，data 字段原样返回。
5. 将打招呼语写入 analysis 字段，标题使用「问题回复」。`,
        userContent: `请根据我的简历，生成一段${style}风格的开场打招呼语`,
      };
    },
  },
  // JD 对标优化：等用户在输入框输入 JD 后执行对标优化
  jdOptimize: {
    userContent: "帮我进行JD对标优化",
    mode: "react",
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
    mode: "react",
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
};
