import type { Flow } from "../types";

// 面试域流程独立配置，通过统一出口接入当前简历助手
export const interviewFlows: Record<string, Flow> = {
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
    build: ([wordCount, style]) => ({
      userContent: `请根据我的简历，生成一段${style}风格、约${wordCount}的面试自我介绍口头稿`,
      // 自我介绍需要综合完整经历，本次请求固定读取整份简历
      requestContext: { resumeScope: "all" },
    }),
  },
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
  specializedInterview: {
    userContent: "帮我进行专项面试模拟",
    steps: [
      {
        question: "请选择本次专项模拟的面试方向",
        options: ["技术面", "业务面"],
      },
    ],
    build: ([direction]) => ({
      userContent: `请根据我的整份简历开展${direction}专项面试模拟。请保持真实面试官角色，每轮只问一个问题；我回答后先针对本轮表现给出十分制评分、反馈与回答技巧，再结合回答继续追问。我可以随时点击“提前结束”，届时请按实际完成度折算分数并说明评估可能不准确。`,
      // 专项模拟需要持续核对完整经历，本次请求固定读取整份简历
      requestContext: { resumeScope: "all" },
    }),
  },
  aptitudeHrInterview: {
    userContent: "帮我进行行测和 HR 面试综合评估",
    steps: [
      {
        question: "完整评估约 45 分钟，将依次进行行测与 HR 面试，过程中可随时提前结束",
        options: ["开始综合评估"],
      },
    ],
    build: () => ({
      userContent:
        "请根据我的整份简历开展行测与 HR 面试综合评估：先进行带建议时限的行测模拟，再进行 HR 软技能面试；每轮只出一道题并等待我回答，完成两个阶段后输出综合评分与反馈报告。我可以随时点击“提前结束”，届时请将未完成项目计入完成度折算，避免阶段性分数虚高，并明确说明评估可能不准确。",
      // HR 评估需要核对完整经历，行测与面试共用本次整份简历上下文
      requestContext: { resumeScope: "all" },
    }),
  },
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
      // 反馈模式只控制逐轮评分，面试节奏由对应技能统一约束
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
};
