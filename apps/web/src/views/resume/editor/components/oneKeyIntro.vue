<script setup lang="ts">
// 优化已经迁入独立弹窗，本组件只保留一键调整的功能说明。
const visible = defineModel<boolean>({ default: false });
const emit = defineEmits<{ confirm: [] }>();

// 用户确认了解功能后交给入口继续进入通用流程
const confirm = () => {
  visible.value = false;
  emit("confirm");
};
</script>

<template>
  <SfModal
    v-model="visible"
    :title="$t('oneClickAdjustIntroTitle')"
    width="480px"
  >
    <div class="flex w-full flex-col gap-3 pb-3 text-left">
      <p class="text-sm leading-6 text-sf-text-2">
        {{ $t("oneClickAdjustIntroDescription") }}
      </p>
      <div class="flex items-start gap-3 rounded-2xl bg-sf-warning-2 p-3 text-sf-warning">
        <SfIcon icon="lucide:triangle-alert" size="5" class="shrink-0" />
        <p class="text-xs leading-5">{{ $t("oneClickAdjustIntroNotice") }}</p>
      </div>
      <div class="flex justify-end gap-3 pt-3">
        <SfButton type="bg" @click="visible = false">{{ $t("cancel") }}</SfButton>
        <SfButton @click="confirm">{{ $t("startOneClickAdjust") }}</SfButton>
      </div>
    </div>
  </SfModal>
</template>
