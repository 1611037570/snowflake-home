import { reportAction, reportVisitor, type ReportActionParams } from "@/apis";
import { getClientId } from "./useClientId";

// 统计上报不应影响页面功能，失败时直接忽略
const silently = (task: Promise<unknown>) => task.catch(() => {});

// 登记访客：应用启动时调用一次，同标识重复访问会刷新最后访问时间
export const reportResumeVisit = () => silently(reportVisitor({ clientId: getClientId() }));

// 上报简历使用动作：新建、导入、导出时调用
export const trackResumeAction = (params: ReportActionParams) => silently(reportAction(params));
