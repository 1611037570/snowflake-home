<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useDebounceFn, useTimeoutFn } from "@vueuse/core";
import { useResumeStore } from "@/stores";
import {
  disableLocalBackup,
  enableLocalBackup,
  initLocalBackup,
  isFileSystemAccessSupported,
  localBackupEnabled,
  writeLocalBackup,
} from "@/utils/modules/localBackup";

// 是否支持本地文件系统接口
const supported = isFileSystemAccessSupported();

const resumeStore = useResumeStore();
const { list, currentIndex, currentData } = storeToRefs(resumeStore);

// 弹窗可见性
const visible = ref(false);
// 绑定的备份目录名
const backupPath = ref("");
// 是否显示备份成功提示
const savedTip = ref(false);

// 当前简历项
const currentItem = computed(() => list.value[currentIndex.value]);

// 触发图标
const icon = computed(() => (localBackupEnabled.value ? "lucide:cloud-check" : "ph:warning-fill"));
// 图标与提示文字颜色
const iconColor = computed(() =>
  localBackupEnabled.value ? "text-sf-success" : "text-sf-warning",
);
// 图标旁提示文字
const tipText = computed(() => {
  if (!localBackupEnabled.value) return "未备份";
  return savedTip.value ? "已备份" : "";
});
// 悬浮提示
const tooltipContent = computed(() =>
  localBackupEnabled.value ? `已备份到本地目录：${backupPath.value}` : "点击开启本地自动备份",
);

// 备份成功后短暂显示提示
const { start: startSavedTip } = useTimeoutFn(
  () => {
    savedTip.value = false;
  },
  3000,
  { immediate: false },
);

// 备份当前简历
const doBackup = async () => {
  if (!localBackupEnabled.value) return;
  const item = currentItem.value;
  if (!item) return;
  const filename = `resume-backup-${item.id}.json`;
  const ok = await writeLocalBackup(filename, JSON.stringify(item, null, 2));
  if (ok) {
    savedTip.value = true;
    startSavedTip();
  }
};

// 简历数据变化后防抖执行备份
const debouncedBackup = useDebounceFn(doBackup, 3000);
watch(currentData, debouncedBackup, { deep: true });

// 初始化绑定状态
onMounted(async () => {
  const name = await initLocalBackup();
  if (name) backupPath.value = name;
});

// 绑定或解绑
const handleBind = async () => {
  if (localBackupEnabled.value) {
    await disableLocalBackup();
    backupPath.value = "";
    savedTip.value = false;
  } else {
    const name = await enableLocalBackup();
    if (name) backupPath.value = name;
  }
};
</script>

<template>
  <div v-if="supported" class="flex items-center">
    <SfTooltip :content="tooltipContent">
      <div
        class="flex cursor-pointer items-center gap-1 rounded-full px-1.5 py-0.5 transition-colors hover:bg-sf-bg-2"
        @click="visible = true"
      >
        <SfIcon :icon="icon" :class="iconColor" size="5" />
        <span v-if="tipText" :class="iconColor" class="text-xs">{{ tipText }}</span>
      </div>
    </SfTooltip>

    <SfModal v-model="visible" title="本地自动备份">
      <div class="flex w-[360px] flex-col gap-4 p-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-sf-text-3">绑定位置</span>
          <span class="text-sm text-sf-text">{{ backupPath || "未绑定" }}</span>
        </div>
        <el-button
          class="w-full"
          :type="localBackupEnabled ? 'danger' : 'primary'"
          @click="handleBind"
        >
          {{ localBackupEnabled ? "解绑" : "选择目录并绑定" }}
        </el-button>
      </div>
    </SfModal>
  </div>
</template>

<style lang="scss" scoped></style>
