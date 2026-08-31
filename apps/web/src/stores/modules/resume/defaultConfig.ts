import { getUUID } from "@/utils";
import { DEFAULT_CONFIG, DEFAULT_USER_CONFIG } from "./formConfig";
import { DEFAULT_UI } from "./uiConfig";

// 默认模块 key 对应的名称（取自 formConfig，后期自行维护）
export const DEFAULT_MODULE_NAMES: { key: string; name: string }[] = [
  { key: "user", name: "用户信息" },
  { key: "account", name: "社交账号" },
  { key: "education", name: "教育经历" },
  { key: "skill", name: "专业技能" },
  { key: "advantage", name: "个人优势" },
  { key: "work", name: "工作经历" },
  { key: "project", name: "项目经历" },
];
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
};
