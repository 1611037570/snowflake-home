<script setup>
// 时间线一致性：检测工作/教育/项目等模块时间重叠与过大间隙，弹窗展示建议
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import Icon from "../components/icon.vue";
import { MODULE_ICONS, useModuleNav } from "../../useModuleNav";
import { useTimelineCheck } from "../../utils";

const resumeStore = useResumeStore();
const { currentData } = storeToRefs(resumeStore);

// 弹窗显隐控制
const visible = ref(false);
// 时间线一致性检查结果
const timelineData = useTimelineCheck(currentData);
// 跳转编辑对应模块：复用模块导航的编辑区跳转逻辑
const { jumpToEditor } = useModuleNav();
const goFill = (key) => {
  jumpToEditor(key);
  visible.value = false;
};

// 问题类型标签
const getTypeLabel = (type) => (type === "overlap" ? "重叠" : "间隙过大");
</script>

<template>
  <Icon content="时间线一致性" icon="mdi:calendar-clock" size="5" @click="visible = true" />

  <SfModal v-model="visible" title="时间线一致性">
    <div class="flex w-[400px] flex-col gap-3">
      <!-- 无问题提示 -->
      <div v-if="!timelineData.issueCount" class="py-6 text-center text-sm text-sf-text-2">
        时间线一致，未发现重叠或过大间隙
      </div>

      <!-- 各模块问题列表 -->
      <template v-for="module in timelineData.list" :key="module.key">
        <div class="rounded-3xl border border-sf-b p-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-lg">
              <SfIcon
                :icon="MODULE_ICONS[module.key] || 'mdi:calendar-clock'"
                size="4"
                class="text-sf-theme"
              />
              <span>{{ module.name }}</span>
            </div>
            <div class="cursor-pointer text-sm text-sf-theme" @click="goFill(module.key)">
              去修改
            </div>
          </div>
          <div class="mt-2 flex flex-col gap-2">
            <div
              v-for="(issue, index) in module.issues"
              :key="index"
              class="flex items-start gap-2 rounded-xl bg-sf-bg-2 p-2 text-sm"
            >
              <span
                class="shrink-0 rounded-full px-2 py-0.5 text-xs"
                :class="
                  issue.type === 'overlap'
                    ? 'bg-sf-error-2 text-sf-error'
                    : 'bg-sf-warning-2 text-sf-warning'
                "
              >
                {{ getTypeLabel(issue.type) }}
              </span>
              <span class="text-sf-text">{{ issue.text }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
