<script setup>
import { ref } from "vue";
import Donation from "@/components/base/donation/donation.vue";

// 赞助弹窗状态同时控制工具轨入口的激活边框。
const visible = ref(false);
</script>

<template>
  <Donation v-model="visible">
    <SfTooltip :content="$t('core.donation.supportProject')" placement="left">
      <SfIcon
        icon="solar:heart-bold"
        size="5"
        boxSize="9"
        class="rounded-xl border bg-transparent transition-all duration-300 hover:scale-105 hover:border-sf-theme hover:text-sf-theme active:scale-95"
        :class="visible ? 'border-sf-theme text-sf-theme' : 'border-transparent text-sf-text-2'"
      />
    </SfTooltip>
  </Donation>
</template>
