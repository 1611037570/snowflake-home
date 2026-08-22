<script setup>
// 投递记录管理：按日聚合一条记录，内部含多平台明细，支持添加、跟进、修改、删除
import { useResumeStatisticsStore } from "@/stores";
import { storeToRefs } from "pinia";
import BatchModal from "./batchModal.vue";
import FollowModal from "./followModal.vue";
import FollowUpList from "./followUpList.vue";
import ApplicationTable from "./applicationTable.vue";

const statisticsStore = useResumeStatisticsStore();
const { applications, followUps } = storeToRefs(statisticsStore);
// 是否有数据（无数据时显示空状态，屏蔽 SfTab）
const hasData = computed(() => applications.value.length || followUps.value.length);

// 标记上岸
const handleLanded = () => {
  statisticsStore.markLanded();
};

// 表格切换标签页
const activeTab = ref("applications");
const tabList = [
  { value: "applications", name: "投递记录" },
  { value: "followUps", name: "状态管理" },
];

// 添加/修改弹窗显隐与当前编辑 id（空表示添加）
const batchVisible = ref(false);
const batchEditId = ref("");
// 跟进弹窗显隐与当前跟进记录 id
const followVisible = ref(false);
const followTargetId = ref("");

// 打开添加弹窗
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
</script>

<template>
  <!-- 无数据时显示空状态 -->
  <div
    v-if="!hasData"
    class="flex flex-col items-center gap-4 rounded-xl border border-sf-b bg-sf-primary p-10 shadow-sm"
  >
    <div class="text-sf-text-2">
      <SfIcon icon="lucide:inbox" size="10" />
    </div>
    <p class="text-sm text-sf-text-2">开始记录你的第一条投递吧</p>
    <div class="flex items-center gap-3">
      <el-button @click="openBatch">添加</el-button>
    </div>
  </div>
  <!-- 有数据时显示 SfTab + 表格 -->
  <div v-else class="flex flex-col rounded-xl border border-sf-b bg-sf-primary p-3">
    <div class="flex items-center justify-between">
      <div class="w-[400px]">
        <SfTab v-model="activeTab" :list="tabList" class="bg-sf-primary"> </SfTab>
      </div>
      <div class="flex items-center gap-3">
        <div>{{ $t("router.resumeStatisticsDesc") }}</div>
        <el-button type="success" plain @click="handleLanded">上岸</el-button>
      </div>
    </div>

    <ApplicationTable
      v-if="activeTab == 'applications'"
      @open-batch="openBatch"
      @open-edit="openEdit"
      @open-follow="openFollow"
    />
    <FollowUpList v-if="activeTab == 'followUps'" />
  </div>

  <BatchModal v-model="batchVisible" :edit-id="batchEditId" />
  <FollowModal v-model="followVisible" :target-id="followTargetId" />
</template>

<style lang="scss" scoped></style>
