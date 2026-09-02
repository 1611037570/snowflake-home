/**
 * 简历命名相关工具：工作年限、简历标题、导出文件名
 */
import { computed } from "vue";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";
import { useResumeStore } from "@/stores";

const resumeStore = useResumeStore();
const { currentData } = storeToRefs(resumeStore);

const user = computed(() => currentData.value?.user?.data || {});

// 计算工作年限（规则：满5个月按1年算，以此类推）
export const workYears = computed(() => {
  const workTime = user.value?.workTime;
  if (!workTime) return "";

  const startDate = dayjs(workTime);
  if (!startDate.isValid()) return "";

  const diffInMonths = dayjs().diff(startDate, "month");
  // 偏移7个月以实现：5-16个月=1年，17-28个月=2年...
  const years = Math.floor((diffInMonths + 7) / 12);

  return years > 0 ? `${years}年经验` : "";
});
export function getResumeTitle(data: any) {
  const defaultName = "未命名简历";
  if (!data) {
    return defaultName;
  }
  const { user, education } = data;
  const name = user?.data?.name || "";
  const edu = education?.data?.[0]?.education || "";
  const position = user?.data?.position || "";
  return [name, edu, position, workYears.value].filter(Boolean).join("-") || defaultName;
}
/**
 * 生成统一格式的导出文件名：年-月-日-简历标题
 * @param title 简历标题
 * @param ext 文件扩展名
 * @returns 统一命名的导出文件名
 */
export function getExportFileName(title: string, ext: string) {
  return `${dayjs().format("YYYY-MM-DD")}-${title}.${ext}`;
}
/**
 * 生成简历标题
 * @returns 简历标题字符串
 */
export const resumeTitle = computed(() => {
  const data = currentData.value;
  return getResumeTitle(data);
});
