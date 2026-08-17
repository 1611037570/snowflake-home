<script setup>
// 投递记录管理：表格展示，支持平台/状态筛选，新增、批量添加、编辑、删除
import { APPLICATION_PLATFORM, APPLICATION_STATUS, useResumeStatisticsStore } from "@/stores";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { reactive } from "vue";

const statisticsStore = useResumeStatisticsStore();
const { applications } = storeToRefs(statisticsStore);
const { proxy } = getCurrentInstance();

// 按钮公共样式（完整类名字面量，可被 Tailwind 识别）
const btnBase =
  "flex h-7 cursor-pointer items-center gap-1 rounded-full px-3 text-xs font-black transition";
const btnDanger = `${btnBase} border border-sf-error text-sf-error hover:bg-sf-error hover:text-white`;
const btnOutline = `${btnBase} border border-sf-theme text-sf-theme hover:bg-sf-theme-2 hover:text-sf-theme-text`;
const btnPrimary = `${btnBase} bg-sf-theme text-sf-theme-text hover:bg-sf-theme-2`;

// 新增/编辑弹窗
const editVisible = ref(false);
// 当前编辑的记录 id，为空表示新增
const editingId = ref("");
const form = reactive({ company: "", platform: "", date: "", status: "" });

// 批量添加弹窗
const batchVisible = ref(false);
const batchForm = reactive({ count: 1, platform: "boss" });

// 筛选条件（空表示全部）
const filter = reactive({ platform: "", status: "" });
// 按平台、状态筛选后的记录
const filteredList = computed(() => {
  return applications.value.filter((item) => {
    const matchPlatform = !filter.platform || item.platform === filter.platform;
    const matchStatus = !filter.status || item.status === filter.status;
    return matchPlatform && matchStatus;
  });
});

// 打开新增弹窗
const openAdd = () => {
  editingId.value = "";
  form.company = "";
  form.platform = "boss";
  form.date = dayjs().format("YYYY-MM-DD");
  form.status = "pending";
  editVisible.value = true;
};
// 打开编辑弹窗
const openEdit = (item) => {
  editingId.value = item.id;
  form.company = item.company;
  form.platform = item.platform;
  form.date = item.date;
  form.status = item.status;
  editVisible.value = true;
};
// 保存投递记录
const handleSave = () => {
  if (!form.company) {
    ElMessage.warning("请填写公司名称");
    return;
  }
  const data = { ...form };
  if (editingId.value) {
    statisticsStore.updateApplication(editingId.value, data);
  } else {
    statisticsStore.addApplication(data);
  }
  editVisible.value = false;
};
// 批量添加投递记录
const handleBatchAdd = () => {
  statisticsStore.addApplications(batchForm.count, batchForm.platform);
  batchVisible.value = false;
};
// 导出当前筛选结果为 CSV
const handleExport = () => {
  if (!filteredList.value.length) {
    ElMessage.warning("暂无数据可导出");
    return;
  }
  const headers = ["公司", "平台", "投递日期", "状态"];
  const rows = filteredList.value.map((item) => [
    item.company,
    getPlatformLabel(item.platform),
    item.date,
    getStatusLabel(item.status),
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
// 表格选中的记录
const selectedList = ref([]);
// 表格多选变化
const handleSelectionChange = (rows) => {
  selectedList.value = rows;
};
// 删除选中的记录
const handleDeleteSelected = () => {
  const count = selectedList.value.length;
  proxy.$confirm(`确定要删除选中的 ${count} 条投递记录吗？`, "删除确认").then(() => {
    selectedList.value.forEach((item) => statisticsStore.deleteApplication(item.id));
    selectedList.value = [];
  });
};
// 状态圆点颜色
const getStatusDotClass = (status) => {
  return APPLICATION_STATUS.find((item) => item.value === status)?.dot || "bg-sf-info";
};
// 状态文案
const getStatusLabel = (status) => {
  return APPLICATION_STATUS.find((item) => item.value === status)?.label || status;
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
        <button
          v-if="selectedList.length"
          type="button"
          :class="btnDanger"
          @click="handleDeleteSelected"
        >
          <SfIcon icon="lucide:trash-2" size="3.5" />
          删除选中（{{ selectedList.length }}）
        </button>
        <button type="button" :class="btnOutline" @click="batchVisible = true">
          <SfIcon icon="mdi:database" size="3.5" />
          批量添加
        </button>
        <button type="button" :class="btnOutline" @click="handleExport">
          <SfIcon icon="material-symbols:download" size="3.5" />
          导出
        </button>
        <button type="button" :class="btnPrimary" @click="openAdd">
          <SfIcon icon="ph:plus-bold" size="3.5" />
          新增投递
        </button>
      </div>
    </div>

    <div class="mt-3 flex items-center gap-3">
      <el-select v-model="filter.platform" clearable placeholder="全部平台" class="w-40">
        <el-option
          v-for="item in APPLICATION_PLATFORM"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-select v-model="filter.status" clearable placeholder="全部状态" class="w-40">
        <el-option
          v-for="item in APPLICATION_STATUS"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <span class="text-xs text-sf-text-2">共 {{ filteredList.length }} 条</span>
    </div>

    <el-table
      :data="filteredList"
      class="mt-3 w-full"
      empty-text="暂无投递记录"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="45" />
      <el-table-column prop="company" label="公司" min-width="180" show-overflow-tooltip />
      <el-table-column label="平台" width="120">
        <template #default="{ row }">{{ getPlatformLabel(row.platform) }}</template>
      </el-table-column>
      <el-table-column prop="date" label="投递日期" width="140" sortable />
      <el-table-column label="状态" width="150">
        <template #default="{ row }">
          <el-select v-model="row.status" size="small" class="w-28">
            <template #prefix>
              <span class="h-2 w-2 rounded-full" :class="getStatusDotClass(row.status)"></span>
            </template>
            <el-option
              v-for="item in APPLICATION_STATUS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="110">
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
            class="cursor-pointer border-0 bg-transparent p-0 text-sf-text-2 transition hover:text-sf-error"
            @click="handleDelete(row)"
          >
            <SfIcon icon="lucide:trash-2" size="4" />
          </button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <SfModal v-model="editVisible" :title="editingId ? '编辑投递记录' : '新增投递记录'">
    <div class="w-[440px]">
      <el-form :model="form" label-width="70px">
        <el-form-item label="公司">
          <el-input v-model="form.company" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="平台">
          <el-select v-model="form.platform" class="w-full">
            <el-option
              v-for="item in APPLICATION_PLATFORM"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="投递日期">
          <el-date-picker
            v-model="form.date"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择投递日期"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" class="w-full">
            <el-option
              v-for="item in APPLICATION_STATUS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="mt-4 flex justify-end gap-2">
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>
  </SfModal>

  <SfModal v-model="batchVisible" title="批量添加投递">
    <div class="w-[440px]">
      <el-form :model="batchForm" label-width="70px">
        <el-form-item label="数量">
          <el-input-number v-model="batchForm.count" :min="1" :max="100" class="w-full" />
        </el-form-item>
        <el-form-item label="平台">
          <el-select v-model="batchForm.platform" class="w-full">
            <el-option
              v-for="item in APPLICATION_PLATFORM"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="text-xs text-sf-text-2">公司名将自动生成（xx月-xx日--随机字母），无需手动填写</div>
      <div class="mt-4 flex justify-end gap-2">
        <el-button @click="batchVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchAdd">确定</el-button>
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
