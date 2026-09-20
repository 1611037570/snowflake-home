/**
 * 图标选择器分类映射表
 * 分类按简历模块与用途划分，key 作为用户数据稳定标识，icon 仅作为当前渲染名称
 */

export interface IconOption {
  /** 用户数据保存的稳定标识，图标替换时不可修改 */
  key: string;
  /** 当前使用的 Iconify 图标名称 */
  icon: string;
  name?: string;
}

export interface IconCategory {
  /** 分类标识 */
  key: string;
  /** 分类名称 */
  name: string;
  /** 该分类下的图标列表 */
  icons: IconOption[];
}

export const ICON_CATEGORIES: IconCategory[] = [
  {
    key: "personal",
    name: "个人信息",
    icons: [
      { key: "personal-account", icon: "mdi:account", name: "个人" },
      { key: "personal-user", icon: "ph:user-duotone", name: "用户" },
      { key: "personal-user-circle", icon: "ph:user-circle-duotone", name: "圆形头像" },
      { key: "personal-file", icon: "basil:file-user-solid", name: "用户档案" },
      { key: "personal-birthday", icon: "mdi:cake-variant", name: "出生日期" },
      { key: "personal-calendar", icon: "mdi:calendar-clock", name: "日历时钟" },
      { key: "personal-clock", icon: "mdi:clock-outline", name: "时钟" },
      { key: "personal-height-weight", icon: "mdi:human-male-height", name: "身高体重" },
      { key: "personal-political", icon: "mdi:flag-outline", name: "政治面貌" },
      { key: "personal-salary", icon: "mdi:currency-cny", name: "期望薪资" },
      { key: "personal-marital", icon: "mdi:heart-outline", name: "婚姻状况" },
      { key: "personal-nation", icon: "mdi:account-group-outline", name: "民族" },
      { key: "personal-current-city", icon: "mdi:home-city-outline", name: "现居城市" },
    ],
  },
  {
    key: "contact",
    name: "联系方式",
    icons: [
      { key: "contact-phone", icon: "mdi:phone", name: "电话" },
      { key: "contact-email", icon: "mdi:email-outline", name: "邮箱" },
      { key: "contact-email-solid", icon: "clarity:email-solid", name: "邮件实心" },
      { key: "contact-city", icon: "mdi:map-marker-outline", name: "期望城市" },
      { key: "contact-native-place", icon: "mdi:home-outline", name: "籍贯" },
    ],
  },
  {
    key: "social",
    name: "社交账号",
    icons: [
      { key: "social-account", icon: "mdi:account-box-outline", name: "社交账号" },
      { key: "social-wechat", icon: "mdi:wechat", name: "微信" },
      { key: "social-linkedin", icon: "mdi:linkedin", name: "领英" },
      { key: "social-github", icon: "simple-icons:github", name: "GitHub" },
      { key: "social-juejin", icon: "simple-icons:juejin", name: "稀土掘金" },
      { key: "social-xiaohongshu", icon: "simple-icons:xiaohongshu", name: "小红书" },
      { key: "social-douyin", icon: "logos:tiktok-icon", name: "抖音" },
    ],
  },
  {
    key: "education",
    name: "教育背景",
    icons: [
      { key: "education-school", icon: "mdi:school-outline", name: "学校" },
      { key: "education-school-solid", icon: "mdi:school", name: "学校实心" },
      { key: "education-book", icon: "mdi:book-open-page-variant", name: "翻开的书" },
      { key: "education-notebook", icon: "mdi:notebook-outline", name: "笔记本" },
      { key: "education-graduation", icon: "ph:graduation-cap-duotone", name: "毕业帽" },
    ],
  },
  {
    key: "work",
    name: "工作经历",
    icons: [
      { key: "work-briefcase", icon: "lucide:briefcase", name: "公文包" },
      { key: "work-time", icon: "mdi:briefcase-clock", name: "商务时钟" },
      { key: "work-office", icon: "mdi:office-building", name: "办公楼" },
      { key: "work-briefcase-duotone", icon: "ph:briefcase-duotone", name: "公文包双色" },
      { key: "work-status", icon: "mdi:briefcase-check-outline", name: "求职状态" },
      { key: "work-performance", icon: "fa-solid:chart-line", name: "业绩曲线" },
      { key: "work-rocket", icon: "fa6-solid:rocket", name: "火箭" },
      { key: "work-target", icon: "fa6-solid:bullseye", name: "靶心" },
    ],
  },
  {
    key: "project",
    name: "项目经历",
    icons: [
      { key: "project-code", icon: "mdi:code-braces", name: "代码花括号" },
      { key: "project-code-tags", icon: "mdi:code-tags", name: "代码标签" },
      { key: "project-widget", icon: "mdi:widgets", name: "组件" },
      { key: "project-dashboard", icon: "mdi:monitor-dashboard", name: "数据看板" },
      { key: "project-file", icon: "mdi:file-code-outline", name: "代码文件" },
      { key: "project-data", icon: "carbon:data-view-alt", name: "数据视图" },
    ],
  },
  {
    key: "skill",
    name: "专业技能",
    icons: [
      { key: "skill-tool", icon: "mdi:hammer-wrench", name: "技能工具" },
      { key: "skill-markdown", icon: "mdi:language-markdown", name: "Markdown" },
      { key: "skill-language", icon: "mdi:translate", name: "语言翻译" },
      { key: "skill-database", icon: "mdi:database", name: "数据库" },
      { key: "skill-chart", icon: "mdi:chart-pie", name: "饼图" },
      { key: "skill-atom", icon: "mdi:atom", name: "原子" },
      { key: "skill-lightning", icon: "ph:lightning-duotone", name: "闪电" },
      { key: "skill-brain", icon: "ph:brain-duotone", name: "大脑" },
      { key: "skill-robot", icon: "mdi:robot-outline", name: "机器人" },
      { key: "skill-fire", icon: "fa6-solid:fire", name: "火焰" },
    ],
  },
  {
    key: "honor",
    name: "荣誉证书",
    icons: [
      { key: "honor-award", icon: "fa6-solid:award", name: "奖章" },
      { key: "honor-trophy", icon: "mdi:trophy-outline", name: "奖杯" },
      { key: "honor-medal", icon: "mdi:medal-outline", name: "勋章" },
      { key: "honor-certificate", icon: "mdi:certificate-outline", name: "证书" },
      { key: "honor-premium", icon: "material-symbols:workspace-premium-outline", name: "获奖" },
    ],
  },
  {
    key: "hobby",
    name: "兴趣爱好",
    icons: [
      { key: "hobby-heart", icon: "solar:heart-bold", name: "爱心" },
      { key: "hobby-music", icon: "majesticons:music", name: "音乐" },
      { key: "hobby-star", icon: "lucide:star", name: "星星" },
      { key: "hobby-palette", icon: "mdi:palette", name: "调色板" },
      { key: "hobby-game", icon: "mdi:gamepad-variant", name: "游戏手柄" },
      { key: "hobby-seedling", icon: "fa6-solid:seedling", name: "幼苗" },
      { key: "hobby-mountain", icon: "fa6-solid:mountain", name: "户外登山" },
      { key: "hobby-camera", icon: "lucide:camera", name: "摄影" },
      { key: "hobby-writing", icon: "fa6-solid:pen", name: "写作" },
      { key: "hobby-microphone", icon: "mdi:microphone", name: "播音" },
    ],
  },
  {
    key: "other",
    name: "其他",
    icons: [
      { key: "other-puzzle", icon: "mdi:puzzle-outline", name: "拼图" },
      { key: "other-gear", icon: "ph:gear-duotone", name: "齿轮" },
      { key: "other-shape", icon: "mdi:shape-outline", name: "形状" },
      { key: "other-tag", icon: "lucide:tag", name: "标签" },
      { key: "other-document", icon: "lucide:file-text", name: "文档" },
      { key: "other-file", icon: "mdi:file-document-outline", name: "文件" },
      { key: "other-image-outline", icon: "material-symbols:image-outline", name: "图片描边" },
      { key: "other-image", icon: "mdi:image", name: "图片" },
      { key: "other-video", icon: "mdi:video", name: "视频" },
    ],
  },
];

export const ICON_ITEMS = ICON_CATEGORIES.flatMap((category) => category.icons);

// 根据用户保存的稳定标识解析当前图标
export const getIconOption = (value?: string) =>
  ICON_ITEMS.find((item) => item.key === value);

export const resolveIcon = (value?: string) => getIconOption(value)?.icon || value || "";
