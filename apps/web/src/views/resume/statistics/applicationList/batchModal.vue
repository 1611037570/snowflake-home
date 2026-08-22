<script setup>
// 添加/修改投递弹窗：动态多行（每行平台 + 数量），含高级设置中的投递日期
import { useResumeStatisticsStore } from "@/stores";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { btnOutline, platformOptions } from "./utils";

// 弹窗显隐（v-model 双向绑定）
const visible = defineModel({ type: Boolean, default: false });
// 当前编辑的投递记录 id（空表示添加）
const props = defineProps({ editId: { type: String, default: "" } });

const statisticsStore = useResumeStatisticsStore();
const { applications } = storeToRefs(statisticsStore);

// 动态多行（每行平台 + 数量）
const rows = ref([{ platform: "boss", count: 1 }]);
// 投递日期（默认当天，高级设置中可修改）
const date = ref(dayjs().format("YYYY-MM-DD"));
// 高级设置展开状态（默认收起）
const advancedVisible = ref(false);

// 新增一行
const addRow = () => {
  rows.value.push({ platform: "boss", count: 1 });
};
// 删除一行
const removeRow = (index) => {
  rows.value.splice(index, 1);
};

// 弹窗打开时根据 editId 初始化表单
watch(
  visible,
  (val) => {
    if (!val) return;
    if (props.editId) {
      // 修改：预填该条投递记录的平台明细与日期
      const target = applications.value.find((item) => item.id === props.editId);
      if (target) {
        rows.value = target.details.map((d) => ({ platform: d.platform, count: d.count }));
        date.value = target.date;
      }
    } else {
      // 添加：重置为默认值
      rows.value = [{ platform: "boss", count: 1 }];
      date.value = dayjs().format("YYYY-MM-DD");
    }
    advancedVisible.value = false;
  },
  { immediate: true },
);

// 提交：添加或修改投递记录（一次可含多个平台明细）
const handleSubmit = () => {
  const merged = new Map();
  rows.value.forEach((row) => {
    if (row.count > 0) {
      merged.set(row.platform, (merged.get(row.platform) || 0) + row.count);
    }
  });
  const details = Array.from(merged.entries()).map(([platform, count]) => ({
    platform,
    count,
  }));
  if (!details.length) {
    ElMessage.warning("请填写至少一条投递数量");
    return;
  }
  if (props.editId) {
    statisticsStore.updateApplication(props.editId, { date: date.value, details });
  } else {
    statisticsStore.addApplications(details, date.value);
  }
  visible.value = false;
};
</script>

<template>
  <SfModal v-model="visible" :title="editId ? '修改投递' : '添加投递'">
    <div class="w-[440px]">
      <el-form label-width="70px">
        <div v-for="(row, index) in rows" :key="index" class="mb-3 flex items-center gap-3">
          <span class="flex items-center justify-center text-xs">平台 {{ index + 1 }}</span>
          <SfSelect v-model="row.platform" :list="platformOptions" class="flex-1" />
          <span class="text-xs text-sf-text-2">数量</span>
          <SfInputNumber v-model="row.count" :min="1" :max="1000" class="w-28 flex-shrink-0" />
          <button
            type="button"
            class="flex-shrink-0 cursor-pointer border-0 bg-transparent p-1 text-sf-text-2 transition hover:text-sf-error"
            @click="removeRow(index)"
          >
            <SfIcon icon="lucide:trash-2" size="4" />
          </button>
        </div>
        <div @click="addRow" class="flex-c cursor-pointer text-base text-sm hover:text-sf-theme">
          <SfIcon icon="lucide:plus" size="3.5" />
          添加一行
        </div>
        <!-- 高级设置：默认收起，展开后可修改投递日期 -->
        <div class="mt-3">
          <button
            type="button"
            class="flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-xs text-sf-text-2 transition hover:text-sf-theme"
            @click="advancedVisible = !advancedVisible"
          >
            <SfIcon
              :icon="advancedVisible ? 'lucide:chevron-down' : 'lucide:chevron-right'"
              size="3.5"
            />
            高级设置
          </button>
          <div v-show="advancedVisible" class="mt-3">
            <el-form-item label="投递日期" class="mb-0">
              <SfDatePicker
                v-model="date"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择投递日期"
                class="w-full"
              />
            </el-form-item>
          </div>
        </div>
      </el-form>
      <div class="my-3 text-xs text-sf-text-2">同一天记录自动合并为一条</div>
      <div class="flex justify-end gap-3">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
