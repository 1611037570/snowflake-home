<script setup>
import Share from "@/views/resume/components/share.vue";
</script>

<template>
  <!-- 复用原分享弹窗，仅将触发入口接入编辑器工具轨。 -->
  <Share>
    <template #trigger="{ open, visible }">
      <SfTooltip content="分享简历" placement="left">
        <SfIcon
          icon="ph:paper-plane-right-fill"
          size="5"
          boxSize="9"
          class="rounded-xl border bg-transparent transition-all duration-300 hover:scale-105 hover:border-sf-theme hover:text-sf-theme active:scale-95"
          :class="visible ? 'border-sf-theme text-sf-theme' : 'border-transparent text-sf-text-2'"
          @click="open"
        />
      </SfTooltip>
    </template>
  </Share>
</template>
