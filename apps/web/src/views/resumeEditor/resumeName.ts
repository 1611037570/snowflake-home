/**
 * 简历命名相关工具：工作年限、简历标题、导出文件名
 */
import { computed } from "vue";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";
import { useResumeStore } from "@/stores";

const resumeStore = useResumeStore();
const { currentData, currentItem } = storeToRefs(resumeStore);

const user = computed(() => currentData.value?.user?.data || {});

// 计算工作年限数字（规则：满5个月按1年算，以此类推）
const calcWorkYears = (workTime: string) => {
  if (!workTime) return 0;

  const startDate = dayjs(workTime);
  if (!startDate.isValid()) return 0;

  const diffInMonths = dayjs().diff(startDate, "month");
  // 偏移7个月以实现：5-16个月=1年，17-28个月=2年...
  const years = Math.floor((diffInMonths + 7) / 12);

  return years > 0 ? years : 0;
};
export const workYearsNumber = computed(() => calcWorkYears(user.value?.workTime));
// 中文工作年限文本：供简历标题与导出文件名等场景使用
export const workYears = computed(() =>
  workYearsNumber.value ? `${workYearsNumber.value}年经验` : "",
);
// 根据完整简历项生成标题，自定义模式优先使用自定义标题
export function getResumeTitle(resumeItem: any) {
  const defaultName = "未命名简历";
  if (!resumeItem) {
    return defaultName;
  }
  if (resumeItem.usage?.titleMode === "custom" && resumeItem.usage.customTitle) {
    return resumeItem.usage.customTitle;
  }
  const { user, education } = resumeItem.data || {};
  const name = user?.data?.name || "";
  const edu = education?.data?.[0]?.education || "";
  const position = user?.data?.position || "";
  const years = calcWorkYears(user?.data?.workTime);
  const experience = years ? `${years}年经验` : "";
  return [name, edu, position, experience].filter(Boolean).join("-") || defaultName;
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
  return getResumeTitle(currentItem.value);
});
