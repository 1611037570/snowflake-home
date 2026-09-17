/**
 * 图标选择器分类映射表
 * 分类按简历模块与用途划分，图标统一使用 iconify 名称，新增图标须先在 icon.ts 的 ICON_LIST 中声明
 */

export interface IconCategory {
  /** 分类标识 */
  key: string;
  /** 分类名称 */
  name: string;
  /** 该分类下的图标列表 */
  icons: { icon: string; name?: string }[];
}

export const ICON_CATEGORIES: IconCategory[] = [
  {
    key: "personal",
    name: "个人信息",
    icons: [
      { icon: "mdi:account", name: "个人" },
      { icon: "ph:user-duotone", name: "用户" },
      { icon: "ph:user-circle-duotone", name: "圆形头像" },
      { icon: "basil:file-user-solid", name: "用户档案" },
      { icon: "mdi:cake-variant", name: "出生日期" },
      { icon: "mdi:calendar-clock", name: "日历时钟" },
      { icon: "mdi:clock-outline", name: "时钟" },
      { icon: "mdi:human-male-height", name: "身高体重" },
      { icon: "mdi:flag-outline", name: "政治面貌" },
      { icon: "mdi:currency-cny", name: "期望薪资" },
    ],
  },
  {
    key: "contact",
    name: "联系方式",
    icons: [
      { icon: "mdi:phone", name: "电话" },
      { icon: "mdi:email-outline", name: "邮箱" },
      { icon: "clarity:email-solid", name: "邮件实心" },
      { icon: "mdi:map-marker-outline", name: "期望城市" },
      { icon: "mdi:home-outline", name: "籍贯" },
    ],
  },
  {
    key: "social",
    name: "社交账号",
    icons: [
      { icon: "mdi:account-box-outline", name: "社交账号" },
      { icon: "mdi:wechat", name: "微信" },
      { icon: "mdi:linkedin", name: "领英" },
      { icon: "simple-icons:github", name: "GitHub" },
      { icon: "simple-icons:juejin", name: "稀土掘金" },
      { icon: "simple-icons:xiaohongshu", name: "小红书" },
      { icon: "logos:tiktok-icon", name: "抖音" },
    ],
  },
  {
    key: "education",
    name: "教育背景",
    icons: [
      { icon: "mdi:school-outline", name: "学校" },
      { icon: "mdi:school", name: "学校实心" },
      { icon: "mdi:book-open-page-variant", name: "翻开的书" },
      { icon: "mdi:notebook-outline", name: "笔记本" },
      { icon: "ph:graduation-cap-duotone", name: "毕业帽" },
    ],
  },
  {
    key: "work",
    name: "工作经历",
    icons: [
      { icon: "lucide:briefcase", name: "公文包" },
      { icon: "mdi:briefcase-clock", name: "商务时钟" },
      { icon: "mdi:office-building", name: "办公楼" },
      { icon: "ph:briefcase-duotone", name: "公文包双色" },
      { icon: "mdi:briefcase-check-outline", name: "求职状态" },
      { icon: "fa-solid:chart-line", name: "业绩曲线" },
      { icon: "fa6-solid:rocket", name: "火箭" },
      { icon: "fa6-solid:bullseye", name: "靶心" },
    ],
  },
  {
    key: "project",
    name: "项目经历",
    icons: [
      { icon: "mdi:code-braces", name: "代码花括号" },
      { icon: "mdi:code-tags", name: "代码标签" },
      { icon: "mdi:widgets", name: "组件" },
      { icon: "mdi:monitor-dashboard", name: "数据看板" },
      { icon: "mdi:file-code-outline", name: "代码文件" },
      { icon: "carbon:data-view-alt", name: "数据视图" },
    ],
  },
  {
    key: "skill",
    name: "专业技能",
    icons: [
      { icon: "mdi:hammer-wrench", name: "技能工具" },
      { icon: "mdi:language-markdown", name: "Markdown" },
      { icon: "mdi:translate", name: "语言翻译" },
      { icon: "mdi:database", name: "数据库" },
      { icon: "mdi:chart-pie", name: "饼图" },
      { icon: "mdi:atom", name: "原子" },
      { icon: "ph:lightning-duotone", name: "闪电" },
      { icon: "ph:brain-duotone", name: "大脑" },
      { icon: "mdi:robot-outline", name: "机器人" },
      { icon: "fa6-solid:fire", name: "火焰" },
    ],
  },
  {
    key: "tech",
    name: "技术栈",
    icons: [
      { icon: "logos:vue", name: "Vue" },
      { icon: "logos:typescript-icon", name: "TypeScript" },
      { icon: "logos:vitejs", name: "Vite" },
      { icon: "logos:pinia", name: "Pinia" },
      { icon: "logos:tailwindcss-icon", name: "Tailwind CSS" },
      { icon: "logos:eslint", name: "ESLint" },
      { icon: "logos:prettier-icon", name: "Prettier" },
      { icon: "logos:axios", name: "Axios" },
      { icon: "logos:router", name: "路由" },
      { icon: "logos:iconify", name: "Iconify" },
      { icon: "logos:pnpm-icon", name: "pnpm" },
      { icon: "logos:dayjs", name: "Day.js" },
      { icon: "logos:husky", name: "Husky" },
    ],
  },
  {
    key: "honor",
    name: "荣誉证书",
    icons: [
      { icon: "fa6-solid:award", name: "奖章" },
      { icon: "mdi:trophy-outline", name: "奖杯" },
      { icon: "mdi:medal-outline", name: "勋章" },
      { icon: "mdi:certificate-outline", name: "证书" },
      { icon: "material-symbols:workspace-premium-outline", name: "获奖" },
    ],
  },
  {
    key: "hobby",
    name: "兴趣爱好",
    icons: [
      { icon: "solar:heart-bold", name: "爱心" },
      { icon: "majesticons:music", name: "音乐" },
      { icon: "lucide:star", name: "星星" },
      { icon: "mdi:palette", name: "调色板" },
      { icon: "mdi:gamepad-variant", name: "游戏手柄" },
      { icon: "fa6-solid:seedling", name: "幼苗" },
      { icon: "fa6-solid:mountain", name: "户外登山" },
      { icon: "lucide:camera", name: "摄影" },
      { icon: "fa6-solid:pen", name: "写作" },
      { icon: "mdi:microphone", name: "播音" },
    ],
  },
  {
    key: "other",
    name: "其他",
    icons: [
      { icon: "mdi:puzzle-outline", name: "拼图" },
      { icon: "ph:gear-duotone", name: "齿轮" },
      { icon: "mdi:shape-outline", name: "形状" },
      { icon: "lucide:tag", name: "标签" },
      { icon: "lucide:file-text", name: "文档" },
      { icon: "mdi:file-document-outline", name: "文件" },
      { icon: "material-symbols:image-outline", name: "图片描边" },
      { icon: "mdi:image", name: "图片" },
      { icon: "mdi:video", name: "视频" },
    ],
  },
];
