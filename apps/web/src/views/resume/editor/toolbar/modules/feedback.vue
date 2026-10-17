<script setup>
import IssueFeedback from "@/views/resume/components/issueFeedback.vue";
</script>

<template>
  <!-- 复用原问题反馈逻辑，仅将触发入口接入编辑器工具轨。 -->
  <IssueFeedback>
    <template #trigger="{ open }">
      <SfTooltip content="问题反馈" placement="left">
        <SfIcon
          icon="ph:chat-teardrop-dots-fill"
          size="5"
          boxSize="9"
          class="rounded-xl border border-transparent bg-transparent text-sf-text-2 transition-all duration-300 hover:scale-105 hover:border-sf-theme hover:text-sf-theme active:scale-95"
          @click="open"
        />
      </SfTooltip>
    </template>
  </IssueFeedback>
</template>
