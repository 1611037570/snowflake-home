<script setup>
// 顶部统计卡片：已投递天数、投递总数、进行中、Offer
import { useResumeStatisticsStore } from "@/stores";
import { storeToRefs } from "pinia";
import { $t } from "@/locales";

const statisticsStore = useResumeStatisticsStore();
const { startDate, appliedDays, totalApplications, activeCount, offerCount } =
  storeToRefs(statisticsStore);

// 修改开始日期弹窗
const editVisible = ref(false);
// 待修改的开始日期
const editDate = ref("");

const openEdit = () => {
  editDate.value = startDate.value;
  editVisible.value = true;
};
// 保存开始投递日期
const handleSave = () => {
  if (editDate.value) {
    statisticsStore.setStartDate(editDate.value);
  }
  editVisible.value = false;
};

// 统计卡片配置
const cards = computed(() => [
  {
    label: $t("resumeStatisticsAppliedDays"),
    value: appliedDays.value,
    unit: $t("resumeStatisticsDaysUnit"),
    icon: "mdi:calendar-clock",
    editable: true,
  },
  {
    label: $t("resumeStatisticsApplicationsTotal"),
    value: totalApplications.value,
    unit: $t("resumeStatisticsTimesUnit"),
    icon: "icon-park-outline:send-one",
    editable: false,
  },
  {
    label: $t("resumeStatisticsInProgress"),
    value: activeCount.value,
    unit: $t("resumeStatisticsCompaniesUnit"),
    icon: "solar:hourglass-line-duotone",
    editable: false,
  },
  {
    label: $t("resumeStatisticsOffer"),
    value: offerCount.value,
    unit: $t("resumeStatisticsItemsUnit"),
    icon: "fa6-solid:award",
    editable: false,
  },
]);
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
    <div
      v-for="card in cards"
      :key="card.label"
      class="border-sf-b flex flex-col rounded-xl border bg-sf-primary p-3 shadow-sm"
    >
      <div class="flex items-center justify-between">
        <span class="flex items-center gap-1.5 text-sm font-bold text-sf-text-2">
          <SfIcon :icon="card.icon" size="4" />
          {{ card.label }}
        </span>
        <button
          v-if="card.editable"
          type="button"
          class="cursor-pointer border-0 bg-transparent p-0 text-sf-theme"
          @click="openEdit"
        >
          <SfIcon icon="lucide:pencil" size="4" />
        </button>
      </div>
      <div class="my-2 flex items-center justify-center gap-1">
        <span class="text-4xl font-black text-sf-theme sm:text-6xl">{{ card.value }}</span>
        <span class="text-xs text-sf-text-2">{{ card.unit }}</span>
      </div>
    </div>
  </div>

  <SfModal v-model="editVisible" :title="$t('resumeStatisticsEditStartDate')">
    <div class="w-full max-w-[360px]">
      <el-date-picker
        v-model="editDate"
        type="date"
        value-format="YYYY-MM-DD"
        :placeholder="$t('resumeStatisticsSelectStartDate')"
        class="w-full"
      />
      <div class="mt-4 flex justify-end gap-2">
        <el-button @click="editVisible = false">{{ $t("resumeStatisticsCancel") }}</el-button>
        <el-button type="primary" @click="handleSave">{{ $t("resumeStatisticsSave") }}</el-button>
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
