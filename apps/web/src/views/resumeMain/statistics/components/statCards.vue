<script setup>
// 顶部统计卡片：已投递天数、投递总数、进行中、Offer
import { useResumeStatisticsStore } from "@/stores";
import { storeToRefs } from "pinia";

const statisticsStore = useResumeStatisticsStore();
const { startDate, appliedDays, applications } = storeToRefs(statisticsStore);

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

// 进行中（待处理 + 已查看 + 面试）
const activeCount = computed(
  () => applications.value.filter((item) => item.status !== "offer" && item.status !== "rejected").length,
);
// Offer 数
const offerCount = computed(
  () => applications.value.filter((item) => item.status === "offer").length,
);

// 统计卡片配置
const cards = computed(() => [
  {
    label: "已投递天数",
    value: appliedDays.value,
    unit: "天",
    icon: "mdi:calendar-clock",
    editable: true,
  },
  {
    label: "投递总数",
    value: applications.value.length,
    unit: "次",
    icon: "icon-park-outline:send-one",
    editable: false,
  },
  {
    label: "进行中",
    value: activeCount.value,
    unit: "家",
    icon: "solar:hourglass-line-duotone",
    editable: false,
  },
  {
    label: "Offer",
    value: offerCount.value,
    unit: "个",
    icon: "fa6-solid:award",
    editable: false,
  },
]);
</script>

<template>
  <div class="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2">
    <div
      v-for="card in cards"
      :key="card.label"
      class="flex flex-col rounded-xl border border-sf-border bg-sf-primary p-4 shadow-sm"
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
      <div class="mt-2 flex items-end gap-1">
        <span class="text-3xl font-black text-sf-theme">{{ card.value }}</span>
        <span class="mb-1 text-xs text-sf-text-2">{{ card.unit }}</span>
      </div>
      <div v-if="card.label === '已投递天数'" class="mt-1 text-xs text-sf-text-2">
        开始投递：{{ startDate }}
      </div>
    </div>
  </div>

  <el-dialog v-model="editVisible" title="修改开始投递日期" width="360px">
    <el-date-picker
      v-model="editDate"
      type="date"
      value-format="YYYY-MM-DD"
      placeholder="请选择开始投递日期"
      class="w-full"
    />
    <template #footer>
      <el-button @click="editVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
