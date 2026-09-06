import { getUUID } from "@/utils";
import { DEFAULT_CONFIG, DEFAULT_USER_CONFIG } from "./formConfig";
import { DEFAULT_UI } from "./uiConfig";

// 简历数据结构版本号：结构变更时递增，旧版本数据不兼容直接清空
export const RESUME_DATA_VERSION = 2;
// 默认模块 key 对应的名称与图标（取自 formConfig，后期自行维护）
export const DEFAULT_MODULE_NAMES: { key: string; name: string; icon: string }[] = [
  { key: "user", name: "用户信息", icon: "mdi:account" },
  { key: "account", name: "社交账号", icon: "mdi:account-box-outline" },
  { key: "education", name: "教育经历", icon: "mdi:school-outline" },
  { key: "skill", name: "专业技能", icon: "mdi:hammer-wrench" },
  { key: "advantage", name: "个人优势", icon: "fa6-solid:seedling" },
  { key: "work", name: "工作经历", icon: "lucide:briefcase" },
  { key: "project", name: "项目经历", icon: "mdi:code-tags" },
  { key: "video", name: "视频作品", icon: "mdi:video" },
  { key: "image", name: "图片作品", icon: "mdi:image" },
];
// “整个简历”占位项：无具体模块选中时作为默认操作对象
export const ALL_MODULE_KEY = "all";
export const ALL_MODULE_NAME = "整个简历";
export const ALL_MODULE_ICON = "lucide:file-text";
export const ALL_MODULE = {
  key: ALL_MODULE_KEY,
  name: ALL_MODULE_NAME,
  icon: ALL_MODULE_ICON,
};
// 自定义模块图标：名称由用户输入动态生成，仅图标在此统一维护
export const CUSTOM_MODULE_ICON = "mdi:puzzle-outline";
// 默认简历项
export const DEFAULT_RESUME_ITEM = {
  // 简历ID
  id: getUUID().slice(0, 6),
  // 简历数据
  data: structuredClone({}),
  // 固定配置
  fixedConfig: structuredClone(DEFAULT_USER_CONFIG),
  // 表单配置
  config: structuredClone(DEFAULT_CONFIG),
  // UI配置
  ui: structuredClone(DEFAULT_UI),
  // 使用信息
  usage: {
    // 是否自定义标题
    customTitle: "",
    // 最后使用时间
    lastUseTime: Date.now(),
    // 创建时间
    createTime: Date.now(),
  },
};
// 默认系统配置
export const DEFAULT_SYSTEM = {
  // 简历数据结构版本号（用于检测并清空旧版本数据）
  dataVersion: RESUME_DATA_VERSION,
  // 是否展示进度
  showProgress: true,
  // 是否展示页码
  showPageNumber: true,
  // 是否固定工具栏
  toolbarAlwaysVisible: false,
  // 是否展示调试控制台
  showDebug: false,
  // 是否展示工具栏工具名称
  showToolName: false,
  // 是否启用窗口过小检测提示
  showWindowTip: true,
  // 是否启用浏览器建议提示
  showBrowserTip: true,
};
// 默认编辑器配置
export const DEFAULT_EDITOR = {
  // 编辑器区域宽度(px)
  editorWidth: 400,
  // AI助手区域宽度(px)
  assistantWidth: 400,
};
