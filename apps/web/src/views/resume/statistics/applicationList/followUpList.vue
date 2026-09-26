<script setup>
// 状态管理：展示从投递记录转移出的面试/Offer/被拒记录，支持状态筛选、删除
import { FOLLOW_UP_STATUS, useResumeStatisticsStore } from "@/stores";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { reactive } from "vue";
import ListFilter from "./listFilter.vue";
import { getFollowUpStatusOptions, getPlatformLabel } from "./utils";
import { $t } from "@/locales";

const statisticsStore = useResumeStatisticsStore();
const { followUps } = storeToRefs(statisticsStore);
const followUpStatusOptions = computed(getFollowUpStatusOptions);
const { proxy } = getCurrentInstance();

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
    ElMessage.warning($t("resumeStatisticsEnterCompanyName"));
    return;
  }
  statisticsStore.updateFollowUp(editId.value, { company: editForm.company });
  editVisible.value = false;
};
// 删除跟进记录
const handleDelete = (item) => {
  proxy.$confirm($t("resumeStatisticsDeleteFollowUpMessage"), $t("resumeStatisticsDeleteConfirm")).then(() => {
    statisticsStore.deleteFollowUp(item.id);
  });
};
// 状态圆点颜色
const getStatusDotClass = (status) => {
  return FOLLOW_UP_STATUS.find((item) => item.value === status)?.dot || "bg-sf-info";
};
</script>

<template>
  <ListFilter v-model:platform="filter.platform" :count="filteredList.length">
    <ElFormItem :label="$t('resumeStatisticsStatus')" prop="status" class="flex-1">
      <SfSelect
        v-model="filter.status"
        clearable
        :placeholder="$t('resumeStatisticsAllStatuses')"
        :list="followUpStatusOptions"
      />
    </ElFormItem>
  </ListFilter>

  <el-table :data="filteredList" class="mt-3 w-full" :empty-text="$t('resumeStatisticsNoFollowUps')">
    <el-table-column prop="company" :label="$t('resumeStatisticsCompany')" min-width="180" show-overflow-tooltip />
    <el-table-column :label="$t('resumeStatisticsPlatform')" width="120">
      <template #default="{ row }">{{ getPlatformLabel(row.platform) }}</template>
    </el-table-column>
    <el-table-column :label="$t('resumeStatisticsStatus')" width="150">
      <template #default="{ row }">
        <SfSelect v-model="row.status" size="small" class="w-28" :list="followUpStatusOptions">
          <template #prefix>
            <span class="h-2 w-2 rounded-full" :class="getStatusDotClass(row.status)"></span>
          </template>
        </SfSelect>
      </template>
    </el-table-column>
    <el-table-column prop="date" :label="$t('resumeStatisticsApplicationDate')" width="140" sortable />
    <el-table-column :label="$t('resumeStatisticsActions')" width="110">
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

  <SfModal v-model="editVisible" :title="$t('resumeStatisticsEditCompanyName')">
    <div class="w-full max-w-[440px]">
      <el-form :model="editForm" label-width="70px">
        <el-form-item :label="$t('resumeStatisticsCompanyName')">
          <SfInput v-model="editForm.company" :placeholder="$t('resumeStatisticsEnterCompanyName')" />
        </el-form-item>
      </el-form>
      <div class="mt-4 flex justify-end gap-2">
        <el-button @click="editVisible = false">{{ $t("resumeStatisticsCancel") }}</el-button>
        <el-button type="primary" @click="handleSave">{{ $t("resumeStatisticsSave") }}</el-button>
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
