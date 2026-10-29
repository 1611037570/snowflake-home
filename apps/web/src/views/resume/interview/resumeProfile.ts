import { calcWorkYears } from "@/domain/resume/workYears";

export interface InterviewResumeProfile {
  position: string; // 简历已填写的目标岗位。
  experienceYears: string; // 按简历参加工作时间及其展示口径计算的工作年限。
}

// 仅为开始页补齐岗位与年限，不生成预览摘要或检查其他资料缺项。
export const readInterviewResumeProfile = (resume: any): InterviewResumeProfile => {
  const user = resume?.data?.user;
  const workTime = user?.data?.workTime;
  const years = calcWorkYears(workTime, { round: user?.ui?.workTime?.display === "round" /* 沿用简历配置的年限取整方式。 */ });
  return {
    position: typeof user?.data?.position === "string" ? user.data.position.trim() : "", // 只读取已填写的求职方向。
    experienceYears: workTime ? years > 0 ? `${years} 年` : "1 年以下" : "", // 没有参加工作时间时留空，避免猜测应届身份。
  };
};
