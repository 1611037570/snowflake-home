<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import Icon from "../../components/icon.vue";
const { proxy } = getCurrentInstance();
// 设置弹窗可见性
const drawerVisible = ref(false);

const resumeStore = useResumeStore();
const { system } = storeToRefs(resumeStore);

function resetSettings() {
  proxy.$confirm(`确认重置所有设置为默认值吗？`, "重置设置确认").then(() => {
    resumeStore.resetSettings();
  });
}
</script>

<template>
  <!-- 设置按钮 -->
  <Icon icon="iconamoon:settings-fill" content="系统设置" @click="drawerVisible = true" />

  <!-- 设置弹窗 -->
  <SfModal v-model="drawerVisible" title="系统设置">
    <div class="flex w-[400px] flex-col">
      <!-- 显示设置 -->
      <SfSetTitle title="显示设置" />
      <SfSetBox>
        <SfSetItem
          title="工具栏常驻"
          info="开启后，预览、AI工具栏会常驻在顶部"
          v-model="system.toolbarAlwaysVisible"
          type="switch"
        />
        <SfSetItem
          title="简历完成进度"
          info="开启后，右侧会显示简历完成进度"
          v-model="system.showProgress"
          type="switch"
        />
        <SfSetItem
          title="调试控制台"
          info="开启后，工具栏会显示调试控制台入口"
          v-model="system.showDebug"
          type="switch"
        />
        <SfSetItem
          title="工具栏工具名称"
          info="开启后，工具栏会显示工具名称"
          v-model="system.showToolName"
          type="switch"
        />
      </SfSetBox>

      <!-- 提示设置 -->
      <SfSetTitle title="提示设置" />
      <SfSetBox>
        <SfSetItem
          title="窗口过小提示"
          info="开启后，浏览器窗口过小时会弹出提醒"
          v-model="system.showWindowTip"
          type="switch"
        />
        <SfSetItem
          title="浏览器建议提示"
          info="开启后，使用非谷歌浏览器时会弹出建议"
          v-model="system.showBrowserTip"
          type="switch"
        />
      </SfSetBox>

      <!-- 数据管理 -->
      <SfSetTitle title="数据管理" />
      <SfSetBox>
        <SfSetItem
          title="重置设置"
          info="点击后，将重置所有设置为默认值"
          modelValue="重置"
          @click="resetSettings"
          type="button"
        />
      </SfSetBox>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
