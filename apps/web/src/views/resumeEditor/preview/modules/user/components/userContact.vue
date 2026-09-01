<script setup>
import { computed, inject } from "vue";
import DiffField from "../../../components/diffField/index.vue";

// 联系方式组件：标签支持图标 / 文字两种模式，对齐方式由使用方通过 class 控制
const previewData = inject("previewData");
const userInfoMode = inject("userInfoMode");
const user = computed(() => previewData.value?.user || {});
const hasPhone = computed(() => !!user.value?.phone?.value);
const hasEmail = computed(() => !!user.value?.email?.value);
</script>

<template>
  <div v-if="hasPhone || hasEmail" class="mt-1 flex max-w-full min-w-0 flex-wrap gap-x-3">
    <div v-if="hasPhone" class="flex max-w-full min-w-0 items-center">
      <SfIcon v-if="userInfoMode === 'icon'" icon="mdi:phone" size="3.5" class="mr-1 shrink-0" />
      <div v-else class="pr-1">电话：</div>
      <div class="max-w-full min-w-0 font-medium">
        <DiffField v-model="user.phone" />
      </div>
    </div>
    <div v-if="hasEmail" class="flex max-w-full min-w-0 flex-wrap items-center">
      <SfIcon
        v-if="userInfoMode === 'icon'"
        icon="mdi:email-outline"
        size="3.5"
        class="mr-1 shrink-0"
      />
      <div v-else class="pr-1">邮箱：</div>
      <div class="max-w-full min-w-0 font-medium">
        <DiffField v-model="user.email" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
