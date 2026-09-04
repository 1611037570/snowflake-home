<script setup>
// 投递记录表格：筛选、导出、删除，弹窗操作通过 emit 抛给父组件
import { useResumeStatisticsStore } from "@/stores";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { reactive } from "vue";
import ListFilter from "./listFilter.vue";
import { btnOutline, getPlatformLabel } from "./utils";

const emit = defineEmits(["openBatch", "openEdit", "openFollow"]);

const statisticsStore = useResumeStatisticsStore();
const { applications } = storeToRefs(statisticsStore);
const { proxy } = getCurrentInstance();

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

// 打开添加弹窗
const openBatch = () => emit("openBatch");
// 打开修改弹窗
const openEdit = (item) => emit("openEdit", item);
// 打开跟进弹窗
const openFollow = (item) => emit("openFollow", item);

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
</script>

<template>
  <div>
    <div class="mt-3 flex items-center justify-end gap-2">
      <button type="button" :class="btnOutline" @click="openBatch">
        <SfIcon icon="mdi:database" size="3.5" />
        添加
      </button>
      <button type="button" :class="btnOutline" @click="handleExport">
        <SfIcon icon="material-symbols:download" size="3.5" />
        导出
      </button>
    </div>

    <ListFilter v-model:platform="filter.platform" :count="filteredList.length" />

    <el-table :data="filteredList" border class="mt-3 w-full rounded-xl" empty-text="暂无投递记录">
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
          <!-- 编辑：绑定 SfTooltip 提示 -->
          <SfTooltip content="编辑" placement="top">
            <button
              type="button"
              class="mr-2 cursor-pointer border-0 bg-transparent p-0 text-sf-text-2 transition hover:text-sf-theme"
              @click="openEdit(row)"
            >
              <SfIcon icon="lucide:pencil" size="4" />
            </button>
          </SfTooltip>
          <!-- 跟进：绑定 SfTooltip 提示 -->
          <SfTooltip content="跟进" placement="top">
            <button
              type="button"
              class="mr-2 cursor-pointer border-0 bg-transparent p-0 text-sf-theme"
              @click="openFollow(row)"
            >
              <SfIcon icon="lucide:git-branch-plus" size="4" />
            </button>
          </SfTooltip>
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
</template>

<style lang="scss" scoped>
.el-table--fit {
  border-bottom: revert-layer !important;
  border-right: revert-layer !important;
}
.el-table--fit {
  border: revert-layer !important;
}
</style>
