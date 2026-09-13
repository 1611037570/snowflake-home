<script setup>
// 顶部统计卡片：已投递天数、投递总数、进行中、Offer
import { useResumeStatisticsStore } from "@/stores";
import { storeToRefs } from "pinia";

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
    label: "航行天数",
    description: "从第一份投递开始",
    value: appliedDays.value,
    unit: "天",
    icon: "mdi:calendar-clock",
    editable: true,
  },
  {
    label: "机会坐标",
    description: "每一份都值得记录",
    value: totalApplications.value,
    unit: "次",
    icon: "icon-park-outline:send-one",
    editable: false,
  },
  {
    label: "轨道进行中",
    description: "正在靠近的机会",
    value: activeCount.value,
    unit: "家",
    icon: "solar:hourglass-line-duotone",
    editable: false,
  },
  {
    label: "抵达星点",
    description: "已收获 Offer",
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
      class="star-track-card relative flex min-h-39 flex-col overflow-hidden rounded-2xl border border-sf-b bg-sf-primary p-3 shadow-sm"
    >
      <div class="relative z-10 flex items-center justify-between">
        <span class="flex items-center gap-3 text-sm font-bold text-sf-text-2">
          <span
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-sf-bg-2 text-sf-theme"
          >
            <SfIcon :icon="card.icon" size="4" />
          </span>
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
      <div class="relative z-10 mt-3 flex items-end gap-1">
        <span class="text-6xl font-black text-sf-theme">{{ card.value }}</span>
        <span class="mb-2 text-xs text-sf-text-2">{{ card.unit }}</span>
      </div>
      <p class="relative z-10 mt-auto text-xs text-sf-text-2">{{ card.description }}</p>
    </div>
  </div>

  <SfModal v-model="editVisible" title="修改开始投递日期">
    <div class="w-[360px]">
      <el-date-picker
        v-model="editDate"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="请选择开始投递日期"
        class="w-full"
      />
      <div class="mt-4 flex justify-end gap-2">
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped>
.star-track-card::after {
  position: absolute;
  right: -1.5rem;
  bottom: -3rem;
  width: 7.5rem;
  height: 7.5rem;
  border: 1px solid var(--sf-border);
  border-radius: 9999px;
  content: "";
}
</style>
