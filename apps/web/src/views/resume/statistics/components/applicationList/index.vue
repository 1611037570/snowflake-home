<script setup>
// 投递记录管理：按日聚合一条记录，内部含多平台明细，支持添加、跟进、修改、删除
import { APPLICATION_PLATFORM, useResumeStatisticsStore } from "@/stores";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { reactive } from "vue";
import BatchModal from "./batchModal.vue";
import FollowModal from "./followModal.vue";

const statisticsStore = useResumeStatisticsStore();
const { applications } = storeToRefs(statisticsStore);
const { proxy } = getCurrentInstance();

// 平台选项（转换为 SfSelect 所需的 { value, name } 结构）
const platformOptions = computed(() =>
  APPLICATION_PLATFORM.map((item) => ({ value: item.value, name: item.label })),
);

// 按钮公共样式（完整类名字面量，可被 Tailwind 识别）
const btnBase =
  "flex h-7 cursor-pointer items-center gap-1 rounded-full px-3 text-xs font-black transition";
const btnOutline = `${btnBase} border border-sf-theme text-sf-theme hover:bg-sf-theme-2 hover:text-sf-theme-text`;

// 添加/修改弹窗显隐与当前编辑 id（空表示添加）
const batchVisible = ref(false);
const batchEditId = ref("");
// 跟进弹窗显隐与当前跟进记录 id
const followVisible = ref(false);
const followTargetId = ref("");

// 筛选条件（空表示全部）
const filter = reactive({ platform: "" });
// 按平台筛选后的记录（明细含该平台即匹配）
const filteredList = computed(() => {
  return applications.value.filter((item) => {
    const matchPlatform =
      !filter.platform || item.details.some((d) => d.platform === filter.platform);
    return matchPlatform;
  });
});

// 打开添加弹窗（供父组件空状态复用）
const openBatch = () => {
  batchEditId.value = "";
  batchVisible.value = true;
};
// 打开修改弹窗
const openEdit = (item) => {
  batchEditId.value = item.id;
  batchVisible.value = true;
};
// 打开跟进弹窗
const openFollow = (item) => {
  followTargetId.value = item.id;
  followVisible.value = true;
};
// 暴露添加弹窗，供父组件复用
defineExpose({ openBatch });
// 导出当前筛选结果为 CSV
const handleExport = () => {
  if (!filteredList.value.length) {
    ElMessage.warning("暂无数据可导出");
    return;
  }
  const headers = ["平台明细", "投递日期", "数量"];
  const rows = filteredList.value.map((item) => [
    item.details.map((d) => `${getPlatformLabel(d.platform)} ${d.count}`).join("、"),
    item.date,
    item.count,
  ]);
  // CSV 转义：含逗号/引号/换行的字段加引号包裹
  const escapeCell = (cell) => {
    const str = String(cell ?? "");
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");
  // 加 BOM 便于 Excel 正确识别中文
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `投递记录_${dayjs().format("YYYYMMDD")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
// 删除投递记录
const handleDelete = (item) => {
  proxy.$confirm("确定要删除这条投递记录吗？", "删除确认").then(() => {
    statisticsStore.deleteApplication(item.id);
  });
};
// 平台标签文案
const getPlatformLabel = (platform) => {
  return APPLICATION_PLATFORM.find((item) => item.value === platform)?.label || platform || "--";
};
</script>

<template>
  <div class="flex flex-col rounded-xl border border-sf-border bg-sf-primary p-4 shadow-sm">
    <div class="flex items-center justify-between">
      <span class="flex items-center gap-1.5 text-sm font-bold text-sf-text-2">
        <SfIcon icon="lucide:briefcase" size="4" />
        投递记录
      </span>
      <div class="flex items-center gap-2">
        <button type="button" :class="btnOutline" @click="openBatch">
          <SfIcon icon="mdi:database" size="3.5" />
          添加
        </button>
        <button type="button" :class="btnOutline" @click="handleExport">
          <SfIcon icon="material-symbols:download" size="3.5" />
          导出
        </button>
      </div>
    </div>

    <div class="mt-3 flex items-center gap-3">
      <SfSelect
        v-model="filter.platform"
        clearable
        placeholder="全部平台"
        class="flex-1"
        :list="platformOptions"
      />
      <span class="text-xs text-sf-text-2">共 {{ filteredList.length }} 条</span>
    </div>

    <el-table :data="filteredList" class="mt-3 w-full" empty-text="暂无投递记录">
      <el-table-column label="平台明细" min-width="220">
        <template #default="{ row }">
          <span class="flex flex-wrap gap-1.5">
            <span
              v-for="d in row.details"
              :key="d.platform"
              class="rounded-full bg-sf-bg-2 px-2 py-0.5 text-xs"
            >
              {{ getPlatformLabel(d.platform) }} {{ d.count }}
            </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="date" label="投递日期" width="140" sortable />
      <el-table-column prop="count" label="数量" width="120" sortable />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <button
            type="button"
            class="mr-2 cursor-pointer border-0 bg-transparent p-0 text-sf-text-2 transition hover:text-sf-theme"
            @click="openEdit(row)"
          >
            <SfIcon icon="lucide:pencil" size="4" />
          </button>
          <button
            type="button"
            class="mr-2 cursor-pointer border-0 bg-transparent p-0 text-sf-theme"
            @click="openFollow(row)"
          >
            <SfIcon icon="lucide:git-branch-plus" size="4" />
          </button>
          <button
            type="button"
            class="cursor-pointer border-0 bg-transparent p-0 text-sf-text-2 transition hover:text-sf-error"
            @click="handleDelete(row)"
          >
            <SfIcon icon="lucide:trash-2" size="4" />
          </button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <BatchModal v-model="batchVisible" :edit-id="batchEditId" />
  <FollowModal v-model="followVisible" :target-id="followTargetId" />
</template>

<style lang="scss" scoped>
:deep(.el-select) {
  width: auto;
}
</style>
