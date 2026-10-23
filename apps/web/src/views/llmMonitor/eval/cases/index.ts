import type { EvalCase, EvalResumeView } from "../types";

// 完整简历快照：覆盖工作、项目、教育、技能，用于验证正常优化与写入链路
const backendResume: EvalResumeView = {
  user: {
    title: "个人信息",
    data: {
      name: "张一凡",
      position: "后端开发工程师",
      workTime: "2019.07",
      phone: "13800000000",
      email: "zhangyifan@example.com",
    },
  },
  work: {
    title: "工作经历",
    data: [
      {
        name: "云启科技",
        post: "后端开发工程师",
        department: "基础架构组",
        city: "杭州",
        startTime: "2021.03",
        endTime: "至今",
        content: "<p>负责订单服务稳定性建设，主导读写分离改造。</p>",
      },
    ],
  },
  project: {
    title: "项目经历",
    data: [
      {
        name: "订单中心重构",
        post: "后端负责人",
        startTime: "2022.05",
        endTime: "2023.01",
        content: "<p>拆分单体订单模块，接口平均耗时从 420ms 降到 90ms。</p>",
      },
    ],
  },
  education: {
    title: "教育经历",
    data: [
      {
        name: "浙江理工大学",
        college: "计算机科学与技术",
        education: "本科",
        startTime: "2015.09",
        endTime: "2019.06",
      },
    ],
  },
  skill: {
    title: "专业技能",
    data: {
      content: "<ul><li>熟悉 Java、Spring Boot 与 MySQL</li><li>熟悉 Redis 缓存与消息队列</li></ul>",
    },
  },
};

// 稀疏简历快照：缺少任职时间与量化信息，用于验证模型是否会补造事实
const graduateResume: EvalResumeView = {
  user: {
    title: "个人信息",
    data: {
      name: "李思远",
      position: "市场专员",
    },
  },
  work: {
    title: "实习经历",
    data: [
      {
        name: "星野文化",
        post: "市场实习生",
        content: "<p>参与新媒体选题与内容排期。</p>",
      },
    ],
  },
  education: {
    title: "教育经历",
    data: [
      {
        name: "南京传媒学院",
        college: "广告学",
        education: "本科",
      },
    ],
  },
};

// 第一期用例：每个入口保留一条正常链路与一条边界，覆盖写入、只读、翻译三类行为
export const evalCases: EvalCase[] = [
  {
    id: "optimize.complete",
    group: "一键优化",
    title: "完整简历 · 岗位优化",
    source: "oneKeyOptimize",
    prompt: "请执行一键优化。求职岗位为「后端开发工程师」。",
    resume: backendResume,
    assertions: [
      { kind: "toolCalled", label: "先读取当前简历", tools: ["read_resume_data"] },
      { kind: "toolCalled", label: "真实写入简历改动", tools: ["propose_resume_edits"] },
      {
        kind: "toolOrder",
        label: "写入发生在读取之后",
        tools: ["read_resume_data", "propose_resume_edits"],
      },
      { kind: "reportChanges", label: "评分报告的改动与真实写入一致" },
      { kind: "htmlValid", label: "富文本字段保持合法 HTML" },
    ],
  },
  {
    id: "optimize.sparse",
    group: "一键优化",
    title: "稀疏简历 · 不编造身份",
    source: "oneKeyOptimize",
    prompt: "请执行一键优化。求职岗位为「市场专员」。",
    resume: graduateResume,
    assertions: [
      { kind: "noFabricatedIdentity", label: "不编造公司与学校" },
      { kind: "htmlValid", label: "富文本字段保持合法 HTML" },
    ],
  },
  {
    id: "write.polish",
    group: "简历编写",
    title: "改写工作经历 · 保持事实",
    source: "chat",
    prompt: "把工作经历的描述改得更突出个人贡献，保持事实不变，直接写入简历。",
    resume: backendResume,
    assertions: [
      { kind: "toolCalled", label: "先读取当前简历", tools: ["read_resume_data"] },
      {
        kind: "toolOrder",
        label: "先读后写",
        tools: ["read_resume_data", "propose_resume_edits"],
      },
      { kind: "htmlValid", label: "富文本字段保持合法 HTML" },
      { kind: "noFabricatedIdentity", label: "不编造公司与学校" },
    ],
  },
  {
    id: "write.analyze-only",
    group: "简历编写",
    title: "只给建议 · 不改简历",
    source: "chat",
    prompt: "帮我看看这份简历有什么问题，只给建议，不要修改简历。",
    resume: backendResume,
    assertions: [
      { kind: "toolCalled", label: "先读取当前简历", tools: ["read_resume_data"] },
      { kind: "noWrite", label: "没有改动简历数据" },
    ],
  },
  {
    id: "translate.english",
    group: "简历翻译",
    title: "翻译为英语 · 同步语言",
    source: "chat",
    prompt: "请把我的简历内容翻译成英语并更新到简历。",
    resume: backendResume,
    assertions: [
      { kind: "toolCalled", label: "真实写入译文", tools: ["propose_resume_edits"] },
      { kind: "languageSynced", label: "写入后同步展示语言" },
      { kind: "htmlValid", label: "富文本字段保持合法 HTML" },
    ],
  },
  {
    id: "write.sparse-complete",
    group: "简历编写",
    title: "补全稀疏简历 · 不编身份",
    source: "chat",
    prompt: "请补全我的简历，让内容更完整一些，可以直接写入。",
    resume: graduateResume,
    assertions: [
      { kind: "noFabricatedIdentity", label: "不编造公司与学校" },
      { kind: "htmlValid", label: "富文本字段保持合法 HTML" },
    ],
  },
];

// 按分组归并，页面据此渲染筛选与列表
export const evalGroups = [...new Set(evalCases.map((item) => item.group))];
