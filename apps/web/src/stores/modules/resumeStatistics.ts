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
    // 投递记录列表（按日期聚合为一条记录，内部含多平台明细，默认待处理）
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
    // 批量新增投递记录：按日期聚合为一条记录，内部含多平台明细，数量累加
    function addApplications(details: { platform: string; count: number }[]) {
      const date = dayjs().format("YYYY-MM-DD");
      const existing = applications.value.find((item) => item.date === date);
      if (existing) {
        // 同日期：合并平台明细，同平台数量累加
        details.forEach((d) => {
          const detail = existing.details.find((item) => item.platform === d.platform);
          if (detail) {
            detail.count += d.count;
          } else {
            existing.details.push({ ...d });
          }
        });
        existing.count = existing.details.reduce((sum, item) => sum + item.count, 0);
      } else {
        applications.value.push({
          id: getUUID().slice(0, 6),
          date,
          details: details.map((d) => ({ ...d })),
          count: details.reduce((sum, item) => sum + item.count, 0),
        });
      }
    }
    // 跟进：从投递记录的指定平台扣减 1 条，转移为一条跟进状态记录
    function followUp(id: string, data: { company: string; status: string; platform: string }) {
      const index = applications.value.findIndex((item) => item.id === id);
      if (index === -1) return;
      const app = applications.value[index];
      const detail = app.details.find((item) => item.platform === data.platform);
      if (!detail || detail.count <= 0) return;
      // 从指定平台明细扣减 1 条
      detail.count -= 1;
      app.count -= 1;
      // 明细数量减到 0 时移除该平台明细
      app.details = app.details.filter((item) => item.count > 0);
      // 投递记录数量减到 0 时移除该条投递记录
      if (app.count <= 0) {
        applications.value.splice(index, 1);
      }
      followUps.value.push({
        id: getUUID().slice(0, 6),
        company: data.company,
        platform: data.platform,
        date: app.date,
        status: data.status,
      });
    }
    // 删除投递记录
    function deleteApplication(id: string) {
      const index = applications.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        applications.value.splice(index, 1);
      }
    }
    // 修改跟进状态记录
    function updateFollowUp(id: string, data: { company: string }) {
      const index = followUps.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        followUps.value[index] = { ...followUps.value[index], ...data };
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

    // 投递总数（投递记录数量求和 + 跟进记录条数）
    const totalApplications = computed(
      () => applications.value.reduce((sum, item) => sum + item.count, 0) + followUps.value.length,
    );
    // 进行中（待处理投递 + 面试中的跟进）
    const activeCount = computed(
      () =>
        applications.value.reduce((sum, item) => sum + item.count, 0) +
        followUps.value.filter((item) => item.status === "interview").length,
    );
    // Offer 数
    const offerCount = computed(
      () => followUps.value.filter((item) => item.status === "offer").length,
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
      updateFollowUp,
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
