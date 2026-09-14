/**
 * 图标选择器分类映射表
 * 图标统一使用 iconify 名称，新增图标须先在 icon.ts 的 ICON_LIST 中声明
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
      { icon: "mdi:email-outline", name: "邮箱" },
      { icon: "mdi:phone", name: "电话" },
      { icon: "mdi:flag-outline", name: "政治面貌" },
      { icon: "mdi:map-marker-outline", name: "期望城市" },
      { icon: "mdi:home-outline", name: "籍贯" },
      { icon: "mdi:human-male-height", name: "身高体重" },
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
    name: "工作经验",
    icons: [
      { icon: "lucide:briefcase", name: "公文包" },
      { icon: "mdi:briefcase-clock", name: "商务时钟" },
      { icon: "mdi:office-building", name: "办公楼" },
      { icon: "ph:briefcase-duotone", name: "公文包双色" },
      { icon: "fa6-solid:rocket", name: "火箭" },
      { icon: "fa6-solid:bullseye", name: "靶心" },
      { icon: "mdi:briefcase-check-outline", name: "求职状态" },
    ],
  },
  {
    key: "skill",
    name: "技能语言",
    icons: [
      { icon: "mdi:hammer-wrench", name: "技能工具" },
      { icon: "mdi:code-tags", name: "代码标签" },
      { icon: "mdi:code-braces", name: "代码花括号" },
      { icon: "mdi:language-markdown", name: "Markdown" },
      { icon: "mdi:atom", name: "原子" },
      { icon: "fa6-solid:fire", name: "火焰" },
    ],
  },
  {
    key: "honor",
    name: "成就证书",
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
    ],
  },
  {
    key: "social",
    name: "社交媒体",
    icons: [
      { icon: "mdi:account-box-outline", name: "社交账号" },
      { icon: "mdi:wechat", name: "微信" },
      { icon: "mdi:linkedin", name: "领英" },
      { icon: "simple-icons:github", name: "GitHub" },
      { icon: "simple-icons:xiaohongshu", name: "小红书" },
    ],
  },
  {
    key: "other",
    name: "其他",
    icons: [
      { icon: "mdi:puzzle-outline", name: "拼图" },
      { icon: "ph:gear-duotone", name: "齿轮" },
      { icon: "mdi:widgets", name: "组件" },
      { icon: "mdi:shape-outline", name: "形状" },
      { icon: "carbon:data-view-alt", name: "数据视图" },
      { icon: "lucide:tag", name: "标签" },
    ],
  },
];
