<template>
  <!-- 简历体检入口按钮 -->
  <Icon icon="ph:stethoscope-duotone" size="5" content="简历体检" @click="visible = true" />

  <!-- 体检弹窗 -->
  <SfModal v-model="visible" title="简历体检" width="520px">
    <div class="flex flex-col gap-3 p-4">
      <!-- 时间线断层 -->
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-sf-text-2"
            >相邻经历时间空窗 ≥ 3 个月（共 {{ gapList.length }} 处）</span
          >
        </div>
        <div
          v-if="!gapList.length"
          class="flex flex-col items-center gap-2 py-10 text-sm text-sf-text-2"
        >
          <SfIcon icon="mdi:check-circle" size="5" class="text-sf-success" />
          未发现 3 个月以上的时间断层
        </div>
        <div v-else class="flex max-h-[45vh] flex-col gap-2 overflow-y-auto pr-1">
          <div
            v-for="(gap, index) in gapList"
            :key="index"
            class="flex items-center gap-3 rounded-xl bg-sf-warning-2 p-3"
          >
            <SfIcon
              icon="solar:danger-triangle-bold-duotone"
              size="4"
              class="shrink-0 text-sf-warning"
            />
            <div class="min-w-0 flex-1 text-xs">
              <div class="truncate text-sf-text">
                {{ gap.prevName }}（{{ gap.prevEnd }}）→ {{ gap.nextName }}（{{ gap.nextStart }}）
              </div>
              <div class="text-sf-warning">空窗 {{ gap.gap }} 个月，建议补充说明</div>
            </div>
            <el-button size="small" @click="jumpAll(gap.moduleName)">定位</el-button>
          </div>
        </div>
      </div>
    </div>
  </SfModal>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useResumeStore } from "@/stores";
import { detectGaps } from "../../../utils.ts";
import { jumpAll } from "../../../useModuleNav.ts";
import Icon from "../../components/icon.vue";

// 弹窗显隐
const visible = ref(false);

const resumeStore = useResumeStore();
const { currentData } = storeToRefs(resumeStore);

// 汇总各时间线模块的时间段并检测断层（空窗 ≥ 3 个月）
const gapList = computed(() => {
  const data = currentData.value;
  if (!data) return [];
  const segments = [];
  const modules = [
    { key: "work", label: "工作经历" },
    { key: "education", label: "教育经历" },
    { key: "project", label: "项目经历" },
  ];
  modules.forEach(({ key, label }) => {
    (data[key]?.data || []).forEach((item) => {
      const [start, end] = Array.isArray(item.time) ? item.time : [];
      segments.push({ name: item.name || label, moduleName: key, start, end });
    });
  });
  // 自定义经历模块（key 以 custom 开头）
  Object.keys(data).forEach((key) => {
    if (!key.startsWith("custom")) return;
    (data[key]?.data || []).forEach((item) => {
      const [start, end] = Array.isArray(item.time) ? item.time : [];
      segments.push({ name: item.name || data[key]?.name || key, moduleName: key, start, end });
    });
  });
  return detectGaps(segments);
});
</script>

<style lang="scss" scoped></style>
