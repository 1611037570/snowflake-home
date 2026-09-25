<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import Icon from "../../components/icon.vue";
import { $t } from "@/locales";
const { proxy } = getCurrentInstance();
// 设置弹窗可见性
const drawerVisible = ref(false);

const resumeStore = useResumeStore();
const { system } = storeToRefs(resumeStore);

function resetSettings() {
  proxy.$confirm($t("resetAllSettings"), $t("resetSettingsConfirm")).then(() => {
    resumeStore.resetSettings();
  });
}
</script>

<template>
  <!-- 设置按钮 -->
  <Icon
    icon="iconamoon:settings-fill"
    :content="$t('systemSettings')"
    @click="drawerVisible = true"
  />

  <!-- 设置弹窗 -->
  <SfModal v-model="drawerVisible" :title="$t('systemSettings')">
    <div class="flex w-[400px] flex-col">
      <!-- 显示设置 -->
      <SfSetTitle :title="$t('displaySettings')" />
      <SfSetBox>
        <SfSetItem
          :title="$t('resumeProgress')"
          :info="$t('resumeProgressInfo')"
          v-model="system.showProgress"
          type="switch"
        />
        <SfSetItem
          :title="$t('debugConsole')"
          :info="$t('debugConsoleInfo')"
          v-model="system.showDebug"
          type="switch"
        />
        <SfSetItem
          :title="$t('toolbarToolName')"
          :info="$t('toolbarToolNameInfo')"
          v-model="system.showToolName"
          type="switch"
        />
        <SfSetItem
          :title="$t('newRecordExpanded')"
          :info="$t('newRecordExpandedInfo')"
          v-model="system.defaultItemExpanded"
          type="switch"
        />
        <SfSetItem
          :title="$t('previewLocate')"
          :info="$t('previewLocateInfo')"
          v-model="system.previewClickLocate"
          type="switch"
        />
      </SfSetBox>

      <SfSetTitle :title="$t('detectionSettings')" />
      <SfSetBox>
        <SfSetItem
          :title="$t('browserSuggestion')"
          :info="$t('browserSuggestionInfo')"
          v-model="system.showBrowserTip"
          type="switch"
        />
      </SfSetBox>

      <!-- 数据管理 -->
      <SfSetTitle :title="$t('dataManagement')" />
      <SfSetBox>
        <SfSetItem
          :title="$t('resetSettings')"
          :info="$t('resetSettingsInfo')"
          :modelValue="$t('reset')"
          @click="resetSettings"
          type="button"
        />
      </SfSetBox>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
