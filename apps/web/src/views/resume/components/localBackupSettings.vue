<script setup lang="ts">
import { onMounted, ref } from "vue";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";

import { $t } from "@/locales";
import {
  disableLocalBackup,
  enableLocalBackup,
  initLocalBackup,
  isFileSystemAccessSupported,
  listLocalBackupFiles,
  localBackupDirectory,
  localBackupEnabled,
  localBackupNeedsAuth,
  requestLocalBackupPermission,
  type LocalBackupFile,
} from "@/utils/modules/localBackup";

// 是否展示用途说明：设置页需要，编辑器弹窗空间有限时关闭
defineProps({
  showHint: { type: Boolean, default: true },
});

// 浏览器是否支持选择本地目录，不支持时只展示说明不给操作入口
const supported = isFileSystemAccessSupported();

// 目录授权与解绑都需用户手势，过程中禁用按钮避免重复触发
const busy = ref(false);

// 目录文件弹窗：用于确认备份是否真的写进去了
const filesVisible = ref(false);
const filesLoading = ref(false);
const filesError = ref(false);
const files = ref<LocalBackupFile[]>([]);

onMounted(async () => {
  // 与编辑器共用同一份全局状态，重复初始化是幂等的
  await initLocalBackup();
});

// 绑定或解绑备份目录：解绑只删除句柄，已写入的文件保留在本地
const toggleBind = async () => {
  if (busy.value) return;
  busy.value = true;
  try {
    if (localBackupEnabled.value) await disableLocalBackup();
    else await enableLocalBackup();
  } finally {
    busy.value = false;
  }
};

// 刷新后目录读写权限会退回待确认状态，需在用户手势中重新申请
const reauthorize = async () => {
  if (busy.value) return;
  busy.value = true;
  try {
    await requestLocalBackupPermission();
  } finally {
    busy.value = false;
  }
};

// 复制目录名：浏览器出于安全不暴露完整路径，只能拿到文件夹名
const copyBackupPath = async () => {
  if (!localBackupDirectory.value) return;
  try {
    await navigator.clipboard.writeText(localBackupDirectory.value);
    ElMessage.success($t("resumeSettingsBackupCopySuccess"));
  } catch {
    ElMessage.warning($t("resumeSettingsBackupCopyFailed"));
  }
};

// 浏览器无法唤起系统文件管理器，改为列出目录内文件确认备份结果
const openBackupFolder = async () => {
  filesVisible.value = true;
  filesLoading.value = true;
  filesError.value = false;
  files.value = [];
  try {
    const result = await listLocalBackupFiles();
    // null 表示未绑定或权限已失效，与「目录里没有文件」区分展示
    if (result === null) filesError.value = true;
    else files.value = result;
  } finally {
    filesLoading.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col gap-3">
    <p v-if="showHint" class="text-sm leading-normal text-sf-text-2">
      {{ $t("resumeSettingsBackupHint") }}
    </p>

    <div class="rounded-2xl bg-sf-bg p-3">
      <div class="flex items-center justify-between gap-3">
        <span class="text-sm text-sf-text-3">{{ $t("resumeSettingsBackupLocation") }}</span>
        <span
          class="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
          :class="
            !supported
              ? 'bg-sf-primary text-sf-text-3'
              : localBackupNeedsAuth
                ? 'bg-sf-warning-2 text-sf-warning'
                : localBackupEnabled
                  ? 'bg-sf-success-2 text-sf-success'
                  : 'bg-sf-primary text-sf-text-3'
          "
        >
          {{
            !supported
              ? $t("resumeSettingsBackupUnsupported")
              : localBackupNeedsAuth
                ? $t("resumeSettingsBackupExpired")
                : localBackupEnabled
                  ? $t("resumeSettingsBackupOn")
                  : $t("resumeSettingsBackupOff")
          }}
        </span>
      </div>
      <div class="mt-3 flex items-center justify-between gap-3">
        <span class="min-w-0 truncate text-sm font-medium">
          {{ localBackupDirectory || $t("resumeSettingsBackupUnbound") }}
        </span>
        <div v-if="localBackupDirectory" class="flex shrink-0 items-center gap-3">
          <SfTooltip :content="$t('resumeSettingsBackupCopy')" placement="top">
            <button
              type="button"
              class="cursor-pointer rounded-lg p-1 text-sf-text-3 transition-colors hover:bg-sf-primary hover:text-sf-theme"
              :aria-label="$t('resumeSettingsBackupCopy')"
              @click="copyBackupPath"
            >
              <SfIcon icon="lucide:copy" size="4" />
            </button>
          </SfTooltip>
          <SfTooltip :content="$t('resumeSettingsBackupFiles')" placement="top">
            <button
              type="button"
              class="cursor-pointer rounded-lg p-1 text-sf-text-3 transition-colors hover:bg-sf-primary hover:text-sf-theme"
              :aria-label="$t('resumeSettingsBackupFiles')"
              @click="openBackupFolder"
            >
              <SfIcon icon="lucide:folder-open" size="4" />
            </button>
          </SfTooltip>
        </div>
      </div>
    </div>

    <div v-if="supported" class="flex flex-wrap gap-3">
      <SfButton :type="localBackupEnabled ? 'error' : 'theme'" :disabled="busy" @click="toggleBind">
        {{ localBackupEnabled ? $t("unbind") : $t("chooseAndBind") }}
      </SfButton>
      <SfButton v-if="localBackupNeedsAuth" plain :disabled="busy" @click="reauthorize">
        {{ $t("reauthorize") }}
      </SfButton>
    </div>

    <!-- 目录文件弹窗：列出目录内文件，用来确认备份是否真的写入 -->
    <SfModal v-model="filesVisible" :title="$t('resumeSettingsBackupFiles')">
      <div class="flex w-[420px] flex-col gap-3">
        <div v-if="filesLoading" class="flex items-center justify-center py-12">
          <SfIcon icon="line-md:loading-twotone-loop" size="6" class="animate-spin text-sf-theme" />
        </div>
        <div
          v-else-if="filesError"
          class="flex flex-col items-center justify-center gap-3 py-12 text-sf-text-2"
        >
          <SfIcon icon="bi:shield-exclamation" size="10" class="text-sf-warning" />
          <span class="text-sm">{{ $t("resumeSettingsBackupFilesFailed") }}</span>
        </div>
        <div
          v-else-if="!files.length"
          class="flex flex-col items-center justify-center gap-3 py-12 text-sf-text-2"
        >
          <SfIcon icon="lucide:folder-open" size="10" class="text-sf-text-3" />
          <span class="text-sm">{{ $t("resumeSettingsBackupFilesEmpty") }}</span>
        </div>
        <SfScrollbar v-else max-height="50vh">
          <div class="flex flex-col">
            <div
              v-for="file in files"
              :key="file.name"
              class="flex items-center justify-between gap-3 border-b border-sf-b py-2 last:border-b-0"
            >
              <span class="min-w-0 truncate text-sm">{{ file.name }}</span>
              <span class="shrink-0 text-xs text-sf-text-3">
                {{ dayjs(file.lastModified).format("YYYY-MM-DD HH:mm") }}
              </span>
            </div>
          </div>
        </SfScrollbar>
      </div>
    </SfModal>
  </div>
</template>
