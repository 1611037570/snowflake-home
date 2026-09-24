<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useDebounceFn } from "@vueuse/core";
import dayjs from "dayjs";
import { useResumeStore } from "@/stores";
import { compactConfigFields } from "@/stores/modules/resume/hooks/useConfigTemplate";
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
const { currentItem } = storeToRefs(resumeStore);

// 弹窗可见性
const visible = ref(false);
// 绑定的备份目录名
const backupPath = ref("");
// 最近一次本地备份状态与时间
const backupStatus = ref("");
const lastBackupTime = ref("");

const getBackupStatusKey = (resumeId, path) => `resume-local-backup:${resumeId}:${path}`;
const restoreBackupStatus = () => {
  const resumeId = currentItem.value?.id;
  if (!resumeId || !backupPath.value) {
    backupStatus.value = "";
    lastBackupTime.value = "";
    return;
  }
  try {
    const status = JSON.parse(localStorage.getItem(getBackupStatusKey(resumeId, backupPath.value)));
    backupStatus.value =
      status?.success === true ? "success" : status?.success === false ? "failed" : "";
    lastBackupTime.value = status?.time || "";
  } catch {
    backupStatus.value = "";
    lastBackupTime.value = "";
  }
};

watch(() => [currentItem.value?.id, backupPath.value], restoreBackupStatus, { immediate: true });

// 悬浮提示
const tooltipContent = computed(() =>
  localBackupEnabled.value
    ? `备份目录：${backupPath.value}${lastBackupTime.value ? `；最近备份：${lastBackupTime.value}` : ""}`
    : "点击开启本地自动备份",
);

const backupState = computed(() => {
  if (!localBackupEnabled.value) {
    return { label: "未开启", icon: "bi:shield-exclamation", class: "text-sf-warning" };
  }
  if (backupStatus.value === "pending") {
    return { label: "正在备份", icon: "lucide:loader-circle", class: "text-sf-theme" };
  }
  if (backupStatus.value === "success") {
    return {
      label: `备份成功 ${dayjs(lastBackupTime.value).format("HH:mm:ss")}`,
      icon: "bi:shield-check",
      class: "text-sf-success",
    };
  }
  if (backupStatus.value === "failed") {
    return {
      label: `备份失败 ${dayjs(lastBackupTime.value).format("HH:mm:ss")}`,
      icon: "bi:shield-exclamation",
      class: "text-sf-error",
    };
  }
  return {
    label: "已开启",
    icon: "bi:shield-check",
    class: "text-sf-text-2",
  };
});

// 备份当前简历
const doBackup = async () => {
  if (!localBackupEnabled.value) return;
  const item = currentItem.value;
  if (!item) return;
  const path = backupPath.value;
  const statusKey = getBackupStatusKey(item.id, path);
  backupStatus.value = "pending";
  // 备份文件名：轻舟简历备份-时间-简历ID（时间精确到秒，避免同名覆盖）
  const filename = `轻舟简历备份-${dayjs().format("YYYY-MM-DD_HH-mm-ss")}-${item.id}.json`;
  // 备份时配置只保留模块 key，减小文件体积
  const backupItem = {
    ...item,
    config: { ...item.config, fields: compactConfigFields(item.config?.fields || []) },
  };
  const success = await writeLocalBackup(filename, JSON.stringify(backupItem, null, 2));
  const time = dayjs().format("YYYY-MM-DD HH:mm:ss");
  try {
    localStorage.setItem(statusKey, JSON.stringify({ success, time }));
  } catch {
    // 浏览器存储不可用时仍保留当前页面的实际备份状态
  }
  if (statusKey === getBackupStatusKey(currentItem.value?.id, backupPath.value)) {
    backupStatus.value = success ? "success" : "failed";
    lastBackupTime.value = time;
  }
};

// 简历数据变化后防抖执行备份
const debouncedBackup = useDebounceFn(doBackup, 3000);
// 订阅简历内容变更脉冲：编辑中不调度，停顿后统一备份，避免对整份简历做深监听
watch(
  () => [resumeStore.isEditing, resumeStore.contentVersion],
  () => {
    if (resumeStore.isEditing) return;
    debouncedBackup();
  },
);

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
  } else {
    const name = await enableLocalBackup();
    if (name) {
      backupPath.value = name;
      // 绑定后立即备份一次，不再等待简历内容变更
      await doBackup();
    }
  }
};
</script>

<template>
  <div v-if="supported" class="flex items-center">
    <SfTooltip :content="tooltipContent">
      <div
        class="flex h-9 cursor-pointer items-center gap-1 rounded-full p-3 transition-colors hover:bg-sf-bg-2"
        @click="visible = true"
      >
        <SfIcon :icon="backupState.icon" :class="backupState.class" size="4" />
        <span class="text-xs" :class="backupState.class">{{ backupState.label }}</span>
      </div>
    </SfTooltip>

    <SfModal v-model="visible" title="本地自动备份">
      <div class="flex w-[360px] flex-col gap-4 p-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-sf-text-3">绑定位置</span>
          <span class="text-sm text-sf-text">{{ backupPath || "未绑定" }}</span>
        </div>
        <SfButton class="w-full" :type="localBackupEnabled ? 'error' : 'theme'" @click="handleBind">
          {{ localBackupEnabled ? "解绑" : "选择目录并绑定" }}
        </SfButton>
      </div>
    </SfModal>
  </div>
</template>

<style scoped></style>
