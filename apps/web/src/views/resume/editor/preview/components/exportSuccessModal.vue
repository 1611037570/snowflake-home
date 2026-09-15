<script setup>
import { ref } from "vue";
import SendResume from "@/views/resume/components/sendResume/index.vue";
import Money from "@/components/base/donation/money.vue";
import eventBus from "@/utils/modules/eventBus";

defineOptions({ name: "ExportSuccessModal" });

// 导出成功弹窗显隐：由外部调用 open 触发
const visible = ref(false);
const deliverResumeRef = ref(null);

// 投递简历：打开投递平台弹窗
const goDeliverResume = () => {
  deliverResumeRef.value?.open();
  visible.value = false;
};

// 关闭成功提示并重新打开导出菜单。
const continueExport = () => {
  visible.value = false;
  eventBus.emit("resume-open-export");
};

// 暴露 open 方法，供父组件在导出成功回调中触发
const open = () => {
  visible.value = true;
};
defineExpose({ open });
</script>

<template>
  <SfModal v-model="visible" title="导出成功">
    <Money />
    <div class="flex-c gap-4">
      <SfButton @click="continueExport">继续导出</SfButton>
      <SfButton @click="visible = false"> 没写完 继续编辑 </SfButton>
      <SfButton @click="goDeliverResume"> 写完了 投递简历 </SfButton>
    </div>
  </SfModal>
  <!-- 投递简历弹窗由本组件统一管理 -->
  <SendResume ref="deliverResumeRef">
    <span />
  </SendResume>
</template>

<style scoped></style>
