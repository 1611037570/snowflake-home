<script setup>
// 状态管理：展示从投递记录转移出的面试/Offer/被拒记录，支持状态筛选、删除
import { APPLICATION_PLATFORM, FOLLOW_UP_STATUS, useResumeStatisticsStore } from "@/stores";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { reactive } from "vue";

const statisticsStore = useResumeStatisticsStore();
const { followUps } = storeToRefs(statisticsStore);
const { proxy } = getCurrentInstance();

// 平台选项（转换为 SfSelect 所需的 { value, name } 结构）
const platformOptions = computed(() =>
  APPLICATION_PLATFORM.map((item) => ({ value: item.value, name: item.label })),
);
// 跟进状态选项
const followUpStatusOptions = computed(() =>
  FOLLOW_UP_STATUS.map((item) => ({ value: item.value, name: item.label })),
);

// 筛选条件（空表示全部）
const filter = reactive({ platform: "", status: "" });
// 按平台、状态筛选后的记录
const filteredList = computed(() => {
  return followUps.value.filter((item) => {
    const matchPlatform = !filter.platform || item.platform === filter.platform;
    const matchStatus = !filter.status || item.status === filter.status;
    return matchPlatform && matchStatus;
  });
});

// 编辑弹窗
const editVisible = ref(false);
// 当前编辑的跟进记录 id
const editId = ref("");
// 编辑表单
const editForm = reactive({ company: "" });

// 打开编辑弹窗
const openEdit = (item) => {
  editId.value = item.id;
  editForm.company = item.company;
  editVisible.value = true;
};
// 保存公司名称修改
const handleSave = () => {
  if (!editForm.company) {
    ElMessage.warning("请填写公司名称");
    return;
  }
  statisticsStore.updateFollowUp(editId.value, { company: editForm.company });
  editVisible.value = false;
};
// 删除跟进记录
const handleDelete = (item) => {
  proxy.$confirm("确定要删除这条跟进记录吗？", "删除确认").then(() => {
    statisticsStore.deleteFollowUp(item.id);
  });
};
// 状态圆点颜色
const getStatusDotClass = (status) => {
  return FOLLOW_UP_STATUS.find((item) => item.value === status)?.dot || "bg-sf-info";
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
        <SfIcon icon="lucide:git-branch" size="4" />
        状态管理
      </span>
    </div>

    <div class="mt-3 flex items-center gap-3">
      <SfSelect
        v-model="filter.platform"
        clearable
        placeholder="全部平台"
        class="flex-1"
        :list="platformOptions"
      />
      <SfSelect
        v-model="filter.status"
        clearable
        placeholder="全部状态"
        class="flex-1"
        :list="followUpStatusOptions"
      />
      <span class="text-xs text-sf-text-2">共 {{ filteredList.length }} 条</span>
    </div>

    <el-table :data="filteredList" class="mt-3 w-full" empty-text="暂无跟进记录">
      <el-table-column prop="company" label="公司" min-width="180" show-overflow-tooltip />
      <el-table-column label="平台" width="120">
        <template #default="{ row }">{{ getPlatformLabel(row.platform) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="150">
        <template #default="{ row }">
          <SfSelect v-model="row.status" size="small" class="w-28" :list="followUpStatusOptions">
            <template #prefix>
              <span class="h-2 w-2 rounded-full" :class="getStatusDotClass(row.status)"></span>
            </template>
          </SfSelect>
        </template>
      </el-table-column>
      <el-table-column prop="date" label="投递日期" width="140" sortable />
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

  <SfModal v-model="editVisible" title="修改公司名称">
    <div class="w-[440px]">
      <el-form :model="editForm" label-width="70px">
        <el-form-item label="公司名称">
          <SfInput v-model="editForm.company" placeholder="请输入公司名称" />
        </el-form-item>
      </el-form>
      <div class="mt-4 flex justify-end gap-2">
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
