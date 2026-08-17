// 简历情况统计 store
import { getUUID } from "@/utils";
import dayjs from "dayjs";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

// 投递状态选项（dot 为状态圆点颜色类）
export const APPLICATION_STATUS = [
  { value: "pending", label: "待处理", dot: "bg-sf-info" },
  { value: "viewed", label: "已查看", dot: "bg-sf-theme" },
  { value: "interview", label: "面试", dot: "bg-sf-warning" },
  { value: "offer", label: "Offer", dot: "bg-sf-success" },
  { value: "rejected", label: "被拒", dot: "bg-sf-error" },
];
// 投递平台选项
export const APPLICATION_PLATFORM = [
  { value: "boss", label: "Boss直聘" },
  { value: "zhilian", label: "智联招聘" },
  { value: "51job", label: "前程无忧" },
  { value: "lagou", label: "拉勾招聘" },
  { value: "liepin", label: "猎聘" },
  { value: "other", label: "其他" },
];
// 随机生成 4 个大写字母
const randomLetters = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
};

export const useResumeStatisticsStore = defineStore(
  "resumeStatistics",
  () => {
    // 开始投递日期（首次进入自动初始化，可手动修改）
    const startDate = ref("");
    // 投递记录列表
    const applications = ref<any[]>([]);

    // 首次进入初始化开始投递日期（仅当未设置时）
    function initStartDate() {
      if (!startDate.value) {
        startDate.value = dayjs().format("YYYY-MM-DD");
      }
    }
    // 已投递天数（含当天，最少 1 天）
    const appliedDays = computed(() => {
      if (!startDate.value) return 0;
      return Math.max(dayjs().startOf("day").diff(dayjs(startDate.value).startOf("day"), "day") + 1, 1);
    });
    // 修改开始投递日期
    function setStartDate(date: string) {
      startDate.value = date;
    }
    // 新增投递记录
    function addApplication(data: any) {
      applications.value.push({ id: getUUID().slice(0, 6), ...data });
    }
    // 批量新增投递记录，公司名自动生成为「xx月-xx日--随机4字母」
    function addApplications(count: number, platform: string) {
      const now = dayjs();
      const date = now.format("YYYY-MM-DD");
      const prefix = `${now.format("MM")}月-${now.format("DD")}日--`;
      for (let i = 0; i < count; i++) {
        applications.value.push({ id: getUUID().slice(0, 6), company: `${prefix}${randomLetters()}`, date, status: "pending", platform });
      }
    }
    // 修改投递记录
    function updateApplication(id: string, data: any) {
      const index = applications.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        applications.value[index] = { ...applications.value[index], ...data };
      }
    }
    // 删除投递记录
    function deleteApplication(id: string) {
      const index = applications.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        applications.value.splice(index, 1);
      }
    }
    // 清空全部投递记录
    function clearApplications() {
      applications.value = [];
    }

    return {
      startDate,
      applications,
      initStartDate,
      appliedDays,
      setStartDate,
      addApplication,
      addApplications,
      updateApplication,
      deleteApplication,
      clearApplications,
    };
  },
  {
    persist: true,
  },
);
