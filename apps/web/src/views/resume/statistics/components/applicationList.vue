<script setup>
// 投递记录管理：表格展示，支持平台筛选，添加、跟进、删除
import { APPLICATION_PLATFORM, FOLLOW_UP_STATUS, useResumeStatisticsStore } from "@/stores";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { reactive } from "vue";

const statisticsStore = useResumeStatisticsStore();
const { applications } = storeToRefs(statisticsStore);
const { proxy } = getCurrentInstance();

// 平台选项（转换为 SfSelect 所需的 { value, name } 结构）
const platformOptions = computed(() =>
  APPLICATION_PLATFORM.map((item) => ({ value: item.value, name: item.label })),
);
// 跟进状态选项
const followUpStatusOptions = computed(() =>
  FOLLOW_UP_STATUS.map((item) => ({ value: item.value, name: item.label })),
);

// 按钮公共样式（完整类名字面量，可被 Tailwind 识别）
const btnBase =
  "flex h-7 cursor-pointer items-center gap-1 rounded-full px-3 text-xs font-black transition";
const btnDanger = `${btnBase} border border-sf-error text-sf-error hover:bg-sf-error hover:text-white`;
const btnOutline = `${btnBase} border border-sf-theme text-sf-theme hover:bg-sf-theme-2 hover:text-sf-theme-text`;

// 添加弹窗
const batchVisible = ref(false);
const batchForm = reactive({ count: 1, platform: "boss" });

// 跟进弹窗
const followVisible = ref(false);
// 当前跟进的投递记录
const followTargetId = ref("");
const followForm = reactive({ company: "", status: "interview" });

// 随机生成 4 个大写字母
const randomLetters = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join(
    "",
  );
};
// 生成随机公司名（xx月-xx日--随机4字母）
const generateCompanyName = () => {
  const now = dayjs();
  return `${now.format("MM")}月-${now.format("DD")}日--${randomLetters()}`;
};

// 筛选条件（空表示全部）
const filter = reactive({ platform: "" });
// 按平台筛选后的记录
const filteredList = computed(() => {
  return applications.value.filter((item) => {
    const matchPlatform = !filter.platform || item.platform === filter.platform;
    return matchPlatform;
  });
});

// 批量添加投递记录
const handleBatchAdd = () => {
  statisticsStore.addApplications(batchForm.count, batchForm.platform);
  batchVisible.value = false;
};
// 打开添加弹窗（供父组件空状态复用）
const openBatch = () => {
  batchVisible.value = true;
};
// 打开跟进弹窗
const openFollow = (item) => {
  followTargetId.value = item.id;
  followForm.company = "";
  followForm.status = "interview";
  followVisible.value = true;
};
// 确认跟进：投递数量 -1，转入状态管理，公司名不填则自动生成
const handleFollow = () => {
  const target = applications.value.find((item) => item.id === followTargetId.value);
  if (!target) return;
  statisticsStore.followUp(followTargetId.value, {
    company: followForm.company || generateCompanyName(),
    status: followForm.status,
    count: 1,
  });
  followVisible.value = false;
};
// 暴露添加弹窗，供父组件复用
defineExpose({ openBatch });
// 导出当前筛选结果为 CSV
const handleExport = () => {
  if (!filteredList.value.length) {
    ElMessage.warning("暂无数据可导出");
    return;
  }
  const headers = ["平台", "投递日期", "数量"];
  const rows = filteredList.value.map((item) => [
    getPlatformLabel(item.platform),
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
      <el-table-column label="平台" width="160">
        <template #default="{ row }">{{ getPlatformLabel(row.platform) }}</template>
      </el-table-column>
      <el-table-column prop="date" label="投递日期" width="140" sortable />
      <el-table-column prop="count" label="数量" width="120" sortable />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
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

  <SfModal v-model="batchVisible" title="添加投递">
    <div class="w-[440px]">
      <el-form :model="batchForm" label-width="70px">
        <el-form-item label="数量">
          <el-input-number v-model="batchForm.count" :min="1" :max="1000" class="w-full" />
        </el-form-item>
        <el-form-item label="平台">
          <SfSelect v-model="batchForm.platform" class="w-full" :list="platformOptions" />
        </el-form-item>
      </el-form>
      <div class="text-xs text-sf-text-2">同平台同日期自动聚合为一条记录，默认状态为待处理</div>
      <div class="mt-4 flex justify-end gap-2">
        <el-button @click="batchVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchAdd">确定</el-button>
      </div>
    </div>
  </SfModal>

  <SfModal v-model="followVisible" title="投递跟进">
    <div class="w-[440px]">
      <el-form :model="followForm" label-width="70px">
        <el-form-item label="公司名称">
          <SfInput v-model="followForm.company" placeholder="留空将自动生成" />
        </el-form-item>
        <el-form-item label="跟进状态">
          <SfSelect v-model="followForm.status" class="w-full" :list="followUpStatusOptions" />
        </el-form-item>
      </el-form>
      <div class="text-xs text-sf-text-2">跟进后将从投递记录中扣减 1 条，转入状态管理</div>
      <div class="mt-4 flex justify-end gap-2">
        <el-button @click="followVisible = false">取消</el-button>
        <el-button type="primary" @click="handleFollow">确定</el-button>
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
