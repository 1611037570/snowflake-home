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

// 表格切换标签页
const activeTab = ref("applications");
// 标签名称拼接当前列表总条数
const tabList = computed(() => [
  { value: "applications", name: `投递记录（${applications.value.length}）` },
  { value: "followUps", name: `状态管理（${followUps.value.length}）` },
]);

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
    class="star-track-empty relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-sf-b bg-sf-primary p-12 text-center shadow-sm"
  >
    <div
      class="relative z-10 flex h-18 w-18 items-center justify-center rounded-full bg-sf-bg-2 text-sf-theme"
    >
      <SfIcon icon="lucide:orbit" size="9" />
    </div>
    <h3 class="relative z-10 text-lg font-black text-sf-text">绘制第一段星轨</h3>
    <p class="relative z-10 text-sm text-sf-text-2">
      从第一份投递开始，让每一次尝试都成为清晰的机会坐标
    </p>
    <div class="relative z-10 flex items-center gap-3">
      <el-button type="primary" @click="openBatch">记录投递</el-button>
    </div>
  </div>
  <!-- 有数据时显示 SfTab + 表格 -->
  <div v-else class="flex flex-col rounded-2xl border border-sf-b bg-sf-primary p-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="hidden h-9 w-9 items-center justify-center rounded-xl bg-sf-bg-2 text-sf-theme sm:flex"
        >
          <SfIcon icon="lucide:orbit" size="4" />
        </div>
        <div class="w-[400px]">
          <SfTab v-model="activeTab" :list="tabList" class="bg-sf-primary"> </SfTab>
        </div>
      </div>
      <div class="hidden text-xs text-sf-text-2 lg:block">
        {{ $t("router.resumeStatisticsDesc") }}
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

<style lang="scss" scoped>
.star-track-empty::before {
  position: absolute;
  top: -5rem;
  left: -4rem;
  width: 12rem;
  height: 12rem;
  border: 1px solid var(--sf-border);
  border-radius: 9999px;
  content: "";
}
</style>
