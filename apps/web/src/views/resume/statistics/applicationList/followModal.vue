<script setup>
// 投递跟进弹窗：从指定平台扣减 1 条投递数量，转入状态管理记录
import { useResumeStatisticsStore } from "@/stores";
import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { reactive } from "vue";
import { followUpStatusOptions, getPlatformLabel } from "./utils";

// 弹窗显隐（v-model 双向绑定）
const visible = defineModel({ type: Boolean, default: false });
// 当前跟进的投递记录 id
const props = defineProps({ targetId: { type: String, default: "" } });

const statisticsStore = useResumeStatisticsStore();
const { applications } = storeToRefs(statisticsStore);

// 跟进表单
const form = reactive({ company: "", status: "interview", platform: "boss" });
// 当前跟进记录的平台明细（供平台下拉选择）
const platformList = ref([]);

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

// 弹窗打开时根据 targetId 初始化表单
watch(
  visible,
  (val) => {
    if (!val || !props.targetId) return;
    const target = applications.value.find((item) => item.id === props.targetId);
    if (!target) return;
    form.company = "";
    form.status = "interview";
    // 平台下拉选项为该记录已有的平台明细
    platformList.value = target.details.map((d) => ({
      value: d.platform,
      name: getPlatformLabel(d.platform),
    }));
    form.platform = target.details[0]?.platform || "boss";
  },
  { immediate: true },
);

// 确认跟进：指定平台投递数量 -1，转入状态管理，公司名不填则自动生成
const handleSubmit = () => {
  if (!props.targetId) return;
  statisticsStore.followUp(props.targetId, {
    company: form.company || generateCompanyName(),
    status: form.status,
    platform: form.platform,
  });
  visible.value = false;
};
</script>

<template>
  <SfModal v-model="visible" title="投递跟进">
    <div class="flex w-[440px] flex-col">
      <el-form :model="form" label-width="70px" class="gap-3">
        <el-form-item label="公司名称" class="pb-3">
          <SfInput v-model="form.company" placeholder="留空将自动生成" />
        </el-form-item>
        <el-form-item label="跟进状态" class="pb-3">
          <SfSelect v-model="form.status" class="w-full" :list="followUpStatusOptions" />
        </el-form-item>
        <el-form-item label="投递平台" class="pb-3">
          <SfSelect v-model="form.platform" class="w-full" :list="platformList" />
        </el-form-item>
      </el-form>
      <div class="flex justify-end gap-3">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped>
:deep(.el-select) {
  width: auto;
}
</style>
