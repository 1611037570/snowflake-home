import { config } from "@/configs";
import XyRequest from "../../request";

const request = new XyRequest({
  baseURL: config.api.baseUrl,
});

// 使用动作类型：新建简历、导入简历、导出简历
export type ResumeEventType = "create" | "import" | "export";
// 文件格式：新建动作不涉及文件，统一记为 none
export type ResumeFileType = "pdf" | "png" | "markdown" | "html" | "json" | "none";
// 导出产出方式：本地渲染、云端渲染、长图导出
export type ResumeExportSource = "local" | "server" | "image";

// 访客登记入参
export interface ReportVisitorParams {
  clientId: string; // 本地生成的匿名标识，用于区分不同访客
}

// 动作上报入参
export interface ReportActionParams {
  eventType: ResumeEventType; // 使用动作类型
  fileType: ResumeFileType; // 涉及的文件格式
  source?: ResumeExportSource; // 导出产出方式，仅导出动作需要
}

// 统计概览返回结构
export interface ResumeStatsOverview {
  visitors: {
    totalUsers: number; // 累计访客数
    newUsersToday: number; // 今日新增访客
    activeUsersToday: number; // 今日活跃访客
  };
  actions: Record<string, number>; // 各动作类型累计次数
  fileTypes: Record<string, number>; // 各文件格式累计次数
  daily: Array<{ date: string; total: number }>; // 每日动作数趋势
}

// 登记匿名访客：同标识重复访问会刷新最后访问时间
export const reportVisitor = async (data: ReportVisitorParams) => {
  const response = await request.post({ url: "/resume/stats/visitor", data });
  // 请求拦截器会返回错误对象，这里统一转为拒绝
  if (response instanceof Error || response?.isAxiosError) throw response;
  return response as { isNew: boolean };
};

// 上报一次简历使用动作
export const reportAction = async (data: ReportActionParams) => {
  const response = await request.post({ url: "/resume/stats/action", data });
  if (response instanceof Error || response?.isAxiosError) throw response;
  return response as { id: number };
};

// 获取统计概览，days 为趋势天数（服务端默认 30，上限 90）
export const getStatsOverview = async (days?: number) => {
  const response = await request.get({
    url: "/resume/stats/overview",
    params: days ? { days } : undefined,
  });
  if (response instanceof Error || response?.isAxiosError) throw response;
  return response as ResumeStatsOverview;
};
