<script setup>
import { compactResumeItem } from "@/domain/resume/theme/resumeUi";
import { computed, onMounted, ref, toRaw, watch } from "vue";
import { storeToRefs } from "pinia";
import { useDebounceFn } from "@vueuse/core";
import dayjs from "dayjs";
import { useResumeStore } from "@/stores";
import { $t } from "@/locales";
import LocalBackupSettings from "@/views/resume/components/localBackupSettings.vue";
import {
  initLocalBackup,
  isFileSystemAccessSupported,
  localBackupDirectory,
  localBackupEnabled,
  writeLocalBackup,
} from "@/utils/modules/localBackup";

// 是否支持本地文件系统接口
const supported = isFileSystemAccessSupported();

// "正在备份"状态的最短展示时长（毫秒）
const BACKUP_PENDING_MIN_DURATION = 500;

const resumeStore = useResumeStore();
const { currentItem } = storeToRefs(resumeStore);

// 弹窗可见性
const visible = ref(false);
// 最近一次本地备份状态与时间
const backupStatus = ref("");
const lastBackupTime = ref("");

const getBackupStatusKey = (resumeId, path) => `resume-local-backup:${resumeId}:${path}`;
const restoreBackupStatus = () => {
  const resumeId = currentItem.value?.id;
  if (!resumeId || !localBackupDirectory.value) {
    backupStatus.value = "";
    lastBackupTime.value = "";
    return;
  }
  try {
    const status = JSON.parse(
      localStorage.getItem(getBackupStatusKey(resumeId, localBackupDirectory.value)),
    );
    backupStatus.value =
      status?.success === true ? "success" : status?.success === false ? "failed" : "";
    lastBackupTime.value = status?.time || "";
  } catch {
    backupStatus.value = "";
    lastBackupTime.value = "";
  }
};

watch(() => [currentItem.value?.id, localBackupDirectory.value], restoreBackupStatus, {
  immediate: true,
});

// 悬浮提示：备份失败时不展示失败时间，改为提示重新授权
const tooltipContent = computed(() => {
  if (!localBackupEnabled.value) return $t("enableLocalBackup");
  if (backupStatus.value === "failed") {
    return `${$t("backupDirectory", { path: localBackupDirectory.value })}；${$t("backupFailedReauthorize")}`;
  }
  return `${$t("backupDirectory", { path: localBackupDirectory.value })}${lastBackupTime.value ? $t("latestBackup", { time: lastBackupTime.value }) : ""}`;
});

const backupState = computed(() => {
  if (!localBackupEnabled.value) {
    return { label: $t("backupDisabled"), icon: "bi:shield-exclamation", class: "text-sf-warning" };
  }
  if (backupStatus.value === "pending") {
    return { label: $t("backupPending"), icon: "lucide:loader-circle", class: "text-sf-theme" };
  }
  if (backupStatus.value === "success") {
    return {
      label: $t("backupSuccess", { time: dayjs(lastBackupTime.value).format("HH:mm:ss") }),
      icon: "bi:shield-check",
      class: "text-sf-success",
    };
  }
  if (backupStatus.value === "failed") {
    return {
      // 备份失败不展示失败时间，改为引导用户去重新授权
      label: $t("backupFailedReauthorize"),
      icon: "bi:shield-exclamation",
      class: "text-sf-error",
    };
  }
  return {
    label: $t("backupEnabled"),
    icon: "bi:shield-check",
    class: "text-sf-text-2",
  };
});

// 备份当前简历
const doBackup = async () => {
  if (!localBackupEnabled.value) return;
  const item = currentItem.value;
  if (!item || !localBackupDirectory.value) return;
  const statusKey = getBackupStatusKey(item.id, localBackupDirectory.value);
  const startTime = Date.now();
  backupStatus.value = "pending";
  // 备份文件名：轻舟简历备份-简历ID（固定文件名，重复备份直接覆盖同一文件）
  const filename = `轻舟简历备份-${item.id}.json`;
  // 备份沿用简历中的精简模块结构
  // structuredClone 前先解除 Vue 响应式代理
  const backupItem = {
    ...item,
    config: { ...item.config, modules: structuredClone(toRaw(item.config?.modules || [])) },
  };
  const success = await writeLocalBackup(filename, JSON.stringify(compactResumeItem(backupItem), null, 2));
  // 备份耗时极短，补足最短展示时长，避免"正在备份"一闪而过
  const elapsed = Date.now() - startTime;
  if (elapsed < BACKUP_PENDING_MIN_DURATION) {
    await new Promise((resolve) => setTimeout(resolve, BACKUP_PENDING_MIN_DURATION - elapsed));
  }
  const time = dayjs().format("YYYY-MM-DD HH:mm:ss");
  try {
    localStorage.setItem(statusKey, JSON.stringify({ success, time }));
  } catch {
    // 浏览器存储不可用时仍保留当前页面的实际备份状态
  }
  if (statusKey === getBackupStatusKey(currentItem.value?.id, localBackupDirectory.value)) {
    backupStatus.value = success ? "success" : "failed";
    lastBackupTime.value = time;
  }
};

// 简历数据变化后防抖执行备份：编辑空闲判定已等待 200ms，此处只需合并极短的连续停顿
const debouncedBackup = useDebounceFn(doBackup, 1000);
// 订阅简历内容变更脉冲：编辑中不调度，停顿后统一备份，避免对整份简历做深监听
watch(
  () => [resumeStore.isEditing, resumeStore.contentVersion],
  () => {
    if (resumeStore.isEditing) return;
    debouncedBackup();
  },
);

// 初始化绑定状态：目录名与开关由工具模块统一维护，与设置页共用
onMounted(async () => {
  await initLocalBackup();
});
</script>

<template>
  <div v-if="supported" class="flex items-center">
    <SfTooltip :content="tooltipContent">
      <div
        class="flex h-9 cursor-pointer items-center gap-1 rounded-full p-3 transition-colors hover:bg-sf-bg-2"
        :aria-label="backupState.label"
        @click="visible = true"
      >
        <SfIcon :icon="backupState.icon" :class="backupState.class" size="4" />
        <!-- 备份成功只保留状态图标，避免与标题旁的“已保存”形成两套成功文案。 -->
        <span v-if="backupStatus !== 'success'" class="text-xs" :class="backupState.class">
          {{ backupState.label }}
        </span>
      </div>
    </SfTooltip>

    <SfModal v-model="visible" :title="$t('localBackup')">
      <div class="w-[360px]">
        <!-- 备份配置与通用设置页共用同一份内容组件，避免两处各写一套 -->
        <LocalBackupSettings :show-hint="false" />
      </div>
    </SfModal>
  </div>
</template>

<style scoped></style>
