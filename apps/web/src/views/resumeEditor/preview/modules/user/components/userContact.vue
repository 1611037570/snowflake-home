<script setup>
import { computed, inject } from "vue";
import Text from "../../text.vue";

// 联系方式组件：标签支持图标 / 文字两种模式，对齐方式由使用方通过 class 控制
const previewData = inject("previewData");
const userInfoMode = inject("userInfoMode");
const user = computed(() => previewData.value?.user || {});
const hasPhone = computed(() => !!user.value?.phone?.value);
const hasEmail = computed(() => !!user.value?.email?.value);
</script>

<template>
  <div v-if="hasPhone || hasEmail" class="mt-1 flex flex-wrap gap-x-6">
    <div v-if="hasPhone" class="flex min-w-0 max-w-full flex-wrap items-center">
      <SfIcon
        v-if="userInfoMode === 'icon'"
        icon="mdi:phone"
        size="3.5"
        class="mr-1 shrink-0"
      />
      <div v-else class="pr-1">电话：</div>
      <div class="min-w-0 max-w-full font-medium">
        <Text v-model="user.phone" />
      </div>
    </div>
    <div v-if="hasEmail" class="flex min-w-0 max-w-full flex-wrap items-center">
      <SfIcon
        v-if="userInfoMode === 'icon'"
        icon="mdi:email-outline"
        size="3.5"
        class="mr-1 shrink-0"
      />
      <div v-else class="pr-1">邮箱：</div>
      <div class="min-w-0 max-w-full font-medium">
        <Text v-model="user.email" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
