/**
 * 简历命名相关工具：工作年限、简历标题、导出文件名
 */
import { computed } from "vue";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";
import i18n from "@/locales";
import { useResumeStore } from "@/stores";

export const useResumeName = () => {
  const resumeStore = useResumeStore();
  const { currentItem } = storeToRefs(resumeStore);

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

  // 根据完整简历项生成标题，自定义模式优先使用自定义标题
  const getResumeTitle = (resumeItem: any) => {
    // 标题含默认名与年限等界面文案，读取时建立语言依赖，切换语言后各处标题同步更新
    i18n.global.locale.value;
    const defaultName = i18n.global.t("resumeNameUntitled");
    if (!resumeItem) {
      return defaultName;
    }
    if (resumeItem.usage?.titleMode === "custom" && resumeItem.usage.customTitle) {
      return resumeItem.usage.customTitle;
    }
    const { user, education } = resumeItem.data || {};
    const name = user?.data?.name || "";
    const edu = education?.list?.[0]?.data?.education || "";
    const position = user?.data?.position || "";
    const years = calcWorkYears(user?.data?.workTime);
    const experience = years ? i18n.global.t("resumeNameYearsExperience", { years }) : "";
    return [name, edu, position, experience].filter(Boolean).join("-") || defaultName;
  };

  /**
   * 生成统一格式的导出文件名：品牌-简历标题-年-月-日
   * @param title 简历标题
   * @param ext 文件扩展名
   * @returns 统一命名的导出文件名
   */
  const getExportFileName = (title: string, ext: string) => {
    return `${i18n.global.t("core.router.resume")}-${title}-${dayjs().format("YYYY-MM-DD")}.${ext}`;
  };

  /**
   * 生成简历标题
   * @returns 简历标题字符串
   */
  const resumeTitle = computed(() => getResumeTitle(currentItem.value));

  return { getResumeTitle, getExportFileName, resumeTitle };
};
