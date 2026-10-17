// 左栏视觉 Demo 的静态演示数据：只用于画界面，不连接真实简历数据与状态。

/** 演示字段：标签在上、控件在下的单行或正文字段 */
export interface DemoField {
  /** 字段标识，仅用于列表 key */
  key: string;
  /** 字段标签 */
  label: string;
  /** 字段演示值 */
  value: string;
  /** 栅格宽度：12 为半行，24 为整行 */
  span: 12 | 24;
  /** 是否为多行正文 */
  textarea?: boolean;
}

/** 演示记录：数组模块中的一条经历 */
export interface DemoRecord {
  /** 记录标识，仅用于列表 key */
  key: string;
  /** 记录标题，例如「公司 · 职位」 */
  title: string;
  /** 记录副信息，例如时间范围 */
  meta: string;
  /** 字段区是否展开 */
  expanded: boolean;
  /** 记录内字段 */
  fields: DemoField[];
}

/** 演示模块：文档流中的一章 */
export interface DemoModule {
  /** 模块标识 */
  key: string;
  /** 模块名称 */
  name: string;
  /** 模块图标 */
  icon: string;
  /** 模块形态：object 为对象模块，array 为记录列表模块 */
  kind: "object" | "array";
  /** 是否在预览中隐藏 */
  hidden?: boolean;
  /** 卡片展示状态：editing 为正在编辑 */
  state?: "normal" | "editing";
  /** 对象模块字段 */
  fields?: DemoField[];
  /** 数组模块记录 */
  records?: DemoRecord[];
}

/** 左侧文档流演示内容 */
export const DEMO_MODULES: DemoModule[] = [
  {
    key: "user",
    name: "个人信息",
    icon: "mdi:account",
    kind: "object",
    state: "editing",
    fields: [
      { key: "name", label: "姓名", value: "杨小舟", span: 12 },
      { key: "position", label: "求职意向", value: "前端工程师", span: 12 },
      { key: "phone", label: "手机号", value: "138 0000 0000", span: 12 },
      { key: "email", label: "邮箱", value: "xiaozhou@example.com", span: 12 },
    ],
  },
  {
    key: "work",
    name: "工作经历",
    icon: "lucide:briefcase",
    kind: "array",
    records: [
      {
        key: "work-1",
        title: "阿里巴巴 · 前端工程师",
        meta: "2021.06 - 至今 · 交易平台",
        expanded: true,
        fields: [
          { key: "company", label: "公司", value: "阿里巴巴（中国）有限公司", span: 12 },
          { key: "post", label: "职位", value: "前端工程师", span: 12 },
          {
            key: "content",
            label: "工作内容",
            value: "负责交易链路前端架构与性能优化，首屏耗时降低 38%，主导组件库迁移。",
            span: 24,
            textarea: true,
          },
        ],
      },
      {
        key: "work-2",
        title: "字节跳动 · 前端工程师",
        meta: "2018.07 - 2021.05 · 增长中台",
        expanded: false,
        fields: [],
      },
    ],
  },
  {
    key: "project",
    name: "项目经历",
    icon: "mdi:code-tags",
    kind: "array",
    records: [
      {
        key: "project-1",
        title: "可视化投放平台",
        meta: "2022.03 - 2022.11 · 前端负责人",
        expanded: false,
        fields: [],
      },
    ],
  },
  {
    key: "education",
    name: "教育经历",
    icon: "mdi:school-outline",
    kind: "array",
    records: [
      {
        key: "education-1",
        title: "同济大学 · 软件工程",
        meta: "2014.09 - 2018.06 · 本科",
        expanded: true,
        fields: [
          { key: "school", label: "学校", value: "同济大学", span: 12 },
          { key: "major", label: "专业", value: "软件工程", span: 12 },
        ],
      },
    ],
  },
  {
    key: "skill",
    name: "专业技能",
    icon: "mdi:hammer-wrench",
    kind: "object",
    fields: [
      {
        key: "skill-content",
        label: "技能",
        value: "Vue 3 / TypeScript / 工程化 / 性能优化 / 可视化",
        span: 24,
        textarea: true,
      },
    ],
  },
  {
    key: "honor",
    name: "荣誉证书",
    icon: "fa6-solid:award",
    kind: "array",
    hidden: true,
    records: [
      {
        key: "honor-1",
        title: "年度优秀员工",
        meta: "2022 · 阿里巴巴",
        expanded: false,
        fields: [],
      },
    ],
  },
];

/** 纸张条目：一条经历在预览中的呈现 */
export interface DemoPaperItem {
  /** 条目主标题 */
  heading: string;
  /** 条目副信息，例如时间与角色 */
  meta: string;
  /** 条目正文行 */
  lines: string[];
}

/** 纸张分节：标题与条目列表 */
export interface DemoPaperSection {
  /** 分节标题 */
  title: string;
  /** 分节内条目 */
  items: DemoPaperItem[];
}

/** 右侧纸张演示内容 */
export const DEMO_PAPER: {
  /** 姓名 */
  name: string;
  /** 求职意向 */
  position: string;
  /** 联系方式行 */
  contact: string;
  /** 分节内容 */
  sections: DemoPaperSection[];
} = {
  name: "杨小舟",
  position: "前端工程师 · 5 年经验",
  contact: "138 0000 0000 · xiaozhou@example.com · 上海",
  sections: [
    {
      title: "工作经历",
      items: [
        {
          heading: "阿里巴巴（中国）有限公司",
          meta: "前端工程师 · 2021.06 - 至今",
          lines: ["负责交易链路前端架构与性能优化，首屏耗时降低 38%。"],
        },
        {
          heading: "字节跳动",
          meta: "前端工程师 · 2018.07 - 2021.05",
          lines: ["从 0 到 1 搭建增长中台前端，支撑日均三百万次活动曝光。"],
        },
      ],
    },
    {
      title: "项目经历",
      items: [
        {
          heading: "可视化投放平台",
          meta: "前端负责人 · 2022.03 - 2022.11",
          lines: ["设计拖拽式投放编排器，投放配置耗时从半天缩短到十分钟。"],
        },
      ],
    },
    {
      title: "教育经历",
      items: [
        {
          heading: "同济大学",
          meta: "软件工程 · 本科 · 2014.09 - 2018.06",
          lines: ["主修课程：数据结构、编译原理、人机交互。"],
        },
      ],
    },
    {
      title: "专业技能",
      items: [
        {
          heading: "工程能力",
          meta: "Vue 3 / TypeScript / 性能优化",
          lines: ["熟悉组件库设计与前端工程化，能独立完成从架构到落地的完整链路。"],
        },
      ],
    },
  ],
};
