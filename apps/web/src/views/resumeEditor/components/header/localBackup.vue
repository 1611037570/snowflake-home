<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useDebounceFn } from "@vueuse/core";
import dayjs from "dayjs";
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
const { currentItem } = storeToRefs(resumeStore);

// 弹窗可见性
const visible = ref(false);
// 绑定的备份目录名
const backupPath = ref("");
// 是否显示已备份提示
const saving = ref(false);

// 悬浮提示
const tooltipContent = computed(() =>
  localBackupEnabled.value ? `已备份到本地目录：${backupPath.value}` : "点击开启本地自动备份",
);

// 备份当前简历
const doBackup = async () => {
  if (!localBackupEnabled.value) return;
  const item = currentItem.value;
  if (!item) return;
  // 备份文件名：轻舟简历备份-时间-简历ID（时间精确到秒，避免同名覆盖）
  const filename = `轻舟简历备份-${dayjs().format("YYYY-MM-DD_HH-mm-ss")}-${item.id}.json`;
  await writeLocalBackup(filename, JSON.stringify(item, null, 2));
  // 保存成功后显示一次已备份提示，2秒后消失
  saving.value = true;
  setTimeout(() => (saving.value = false), 1200);
};

// 简历数据变化后防抖执行备份
const debouncedBackup = useDebounceFn(doBackup, 3000);
watch(currentItem, debouncedBackup, { deep: true });

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
    if (name) backupPath.value = name;
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
        <!-- 未备份：警示图标（呼吸动画）+ 未备份文字 -->
        <template v-if="!localBackupEnabled">
          <SfIcon icon="bi:shield-exclamation" class="icon-breath text-sf-warning" size="4" />
          <span class="text-xs text-sf-warning">未备份</span>
        </template>
        <!-- 已备份：保存成功后短暂展示图标 + 已备份文字，2秒后消失 -->
        <template v-else>
          <Transition name="tip-slide" :duration="{ enter: 300, leave: 0 }">
            <span v-if="saving" class="flex items-center gap-1 text-sf-success">
              <SfIcon icon="bi:shield-check" size="4" />
              <span class="text-xs">已备份</span>
            </span>
          </Transition>
        </template>
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

<style lang="scss" scoped>
.tip-slide-enter-active,
.tip-slide-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.tip-slide-enter-from,
.tip-slide-leave-to {
  transform: translateX(-8px);
  opacity: 0;
}

// 未备份时图标的呼吸动画（放大缩小循环）
.icon-breath {
  animation: icon-breath 2s ease-in-out infinite;
}

@keyframes icon-breath {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
</style>
