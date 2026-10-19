<script setup>
import Money from "@/components/base/donation/money.vue";
</script>

<template>
  <!-- 提示折叠面板：每个标题增加对应图标、色块与描述美化 -->
  <SfCollapse class="deliver-collapse mb-4">
    <SfCollapseItem name="author">
      <template #title>
        <div class="flex items-center">
          <span class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-pink-100">
            <SfIcon icon="solar:heart-bold" class="text-pink-500" size="4" />
          </span>
          <span class="text-sm font-medium text-sf-text">{{ $t("resumeSendAuthorMessage") }}</span>
        </div>
      </template>

      {{ $t("resumeSendAuthorMessageText") }}
    </SfCollapseItem>
    <SfCollapseItem name="money">
      <template #title>
        <div class="flex items-center">
          <span class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-pink-100">
            <SfIcon icon="solar:heart-bold" class="text-pink-500" size="4" />
          </span>
          <span class="text-sm font-medium text-sf-text">{{ $t("resumeSendSupportProject") }}</span>
        </div>
      </template>
      <Money />
    </SfCollapseItem>
    <SfCollapseItem name="safe">
      <template #title>
        <div class="flex items-center">
          <span
            class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-amber-100"
          >
            <SfIcon icon="bi:shield-exclamation" size="4" class="text-amber-500" />
          </span>
          <span class="text-sm font-medium text-sf-text">{{ $t("resumeSendSafetyTip") }}</span>
        </div>
      </template>

      {{ $t("resumeSendSafetyTipText") }}
    </SfCollapseItem>
    <SfCollapseItem name="fraud">
      <template #title>
        <div class="flex items-center">
          <span
            class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100"
          >
            <SfIcon icon="stash:lock-closed" size="4" class="text-emerald-500" />
          </span>
          <span class="text-sm font-medium text-sf-text">{{ $t("resumeSendFraudGuide") }}</span>
        </div>
      </template>
      {{ $t("resumeSendFraudGuideText") }}
    </SfCollapseItem>
  </SfCollapse>
</template>

<style lang="scss" scoped></style>
