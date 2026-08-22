// 简历情况统计 store
import { getUUID } from "@/utils";
import dayjs from "dayjs";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

// 投递跟进状态选项（dot 为状态圆点颜色类）
export const FOLLOW_UP_STATUS = [
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

export const useResumeStatisticsStore = defineStore(
  "resumeStatistics",
  () => {
    // 开始投递日期（首次进入自动初始化，可手动修改）
    const startDate = ref("");
    // 投递记录列表（聚合记录：平台 + 日期 + 数量，默认待处理）
    const applications = ref<any[]>([]);
    // 跟进状态记录列表（从投递记录转移出的面试/Offer/被拒记录）
    const followUps = ref<any[]>([]);

    // 首次进入初始化开始投递日期（仅当未设置时）
    function initStartDate() {
      if (!startDate.value) {
        startDate.value = dayjs().format("YYYY-MM-DD");
      }
    }
    // 已投递天数（含当天，最少 1 天）
    const appliedDays = computed(() => {
      if (!startDate.value) return 0;
      return Math.max(
        dayjs().startOf("day").diff(dayjs(startDate.value).startOf("day"), "day") + 1,
        1,
      );
    });
    // 修改开始投递日期
    function setStartDate(date: string) {
      startDate.value = date;
    }
    // 批量新增投递记录：同平台同日期聚合为一条，数量累加
    function addApplications(count: number, platform: string) {
      const date = dayjs().format("YYYY-MM-DD");
      const existing = applications.value.find(
        (item) => item.platform === platform && item.date === date,
      );
      if (existing) {
        existing.count += count;
      } else {
        applications.value.push({ id: getUUID().slice(0, 6), platform, date, count });
      }
    }
    // 跟进：从投递记录扣减数量，转移为一条跟进状态记录
    function followUp(id: string, data: { company: string; status: string; count: number }) {
      const index = applications.value.findIndex((item) => item.id === id);
      if (index === -1) return;
      const app = applications.value[index];
      const n = Math.min(data.count, app.count);
      if (n <= 0) return;
      app.count -= n;
      // 数量减到 0 时移除该条投递记录
      if (app.count <= 0) {
        applications.value.splice(index, 1);
      }
      followUps.value.push({
        id: getUUID().slice(0, 6),
        company: data.company,
        platform: app.platform,
        date: app.date,
        status: data.status,
        count: n,
      });
    }
    // 删除投递记录
    function deleteApplication(id: string) {
      const index = applications.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        applications.value.splice(index, 1);
      }
    }
    // 删除跟进状态记录
    function deleteFollowUp(id: string) {
      const index = followUps.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        followUps.value.splice(index, 1);
      }
    }
    // 清空全部投递记录
    function clearApplications() {
      applications.value = [];
    }

    // 投递总数（投递记录数量求和 + 跟进记录数量求和）
    const totalApplications = computed(
      () =>
        applications.value.reduce((sum, item) => sum + item.count, 0) +
        followUps.value.reduce((sum, item) => sum + item.count, 0),
    );
    // 进行中（待处理投递 + 面试中的跟进）
    const activeCount = computed(
      () =>
        applications.value.reduce((sum, item) => sum + item.count, 0) +
        followUps.value
          .filter((item) => item.status === "interview")
          .reduce((sum, item) => sum + item.count, 0),
    );
    // Offer 数
    const offerCount = computed(() =>
      followUps.value
        .filter((item) => item.status === "offer")
        .reduce((sum, item) => sum + item.count, 0),
    );

    return {
      startDate,
      applications,
      followUps,
      initStartDate,
      appliedDays,
      setStartDate,
      addApplications,
      followUp,
      deleteApplication,
      deleteFollowUp,
      clearApplications,
      totalApplications,
      activeCount,
      offerCount,
    };
  },
  {
    persist: true,
  },
);
