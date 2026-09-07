// 建议卡片配置：点击后直接发送一句话请求，参数与执行流程由对应技能引导追问
import type { SuggestCard } from "./types";

export const suggestions: SuggestCard[] = [
  {
    icon: "ph:file-plus-duotone",
    title: "AI生成简历",
    userContent: "帮我从零生成一段简历经历",
  },
  {
    icon: "ph:magic-wand-duotone",
    title: "AI优化简历",
    userContent: "帮我优化简历",
  },
  {
    icon: "ph:translate-duotone",
    title: "AI简历翻译",
    userContent: "帮我进行简历翻译",
  },
  {
    icon: "ph:target-duotone",
    title: "JD对标优化",
    userContent: "帮我进行JD对标优化",
  },
  {
    icon: "ph:hand-waving-duotone",
    title: "打招呼语",
    userContent: "帮我生成打招呼语",
  },
  {
    icon: "ph:microphone-duotone",
    title: "面试自我介绍",
    userContent: "帮我生成面试自我介绍",
  },
  {
    icon: "ph:chats-teardrop-duotone",
    title: "AI简历面试",
    userContent: "帮我进行AI简历面试",
  },
  {
    icon: "ph:star-duotone",
    title: "AI简历打分",
    userContent: "帮我进行AI简历打分",
  },
];
