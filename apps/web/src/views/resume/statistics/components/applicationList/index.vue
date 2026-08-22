<script setup>
// 投递记录管理：按日聚合一条记录，内部含多平台明细，支持添加、跟进、修改、删除
import BatchModal from "./batchModal.vue";
import FollowModal from "./followModal.vue";
import FollowUpList from "./followUpList.vue";
import ApplicationTable from "./applicationTable.vue";

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
</script>

<template>
  <div class="flex flex-col rounded-xl border border-sf-border bg-sf-primary p-3">
    <SfTab v-model="activeTab" :list="tabList" class="bg-sf-primary"> </SfTab>

    <ApplicationTable
      v-if="activeTab == 'applications'"
      class="mt-3"
      @open-batch="openBatch"
      @open-edit="openEdit"
      @open-follow="openFollow"
    />
    <FollowUpList v-if="activeTab == 'followUps'" class="mt-3" />
  </div>

  <BatchModal v-model="batchVisible" :edit-id="batchEditId" />
  <FollowModal v-model="followVisible" :target-id="followTargetId" />
</template>

<style lang="scss" scoped></style>
