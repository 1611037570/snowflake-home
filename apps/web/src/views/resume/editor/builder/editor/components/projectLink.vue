<script setup>
import { computed } from "vue";

// 项目链接数据：对象 { name, url }
const modelValue = defineModel("modelValue", {
  type: Object,
  default: () => ({}),
});

const name = computed({
  get: () => modelValue.value?.name,
  set: (value) => {
    modelValue.value = { ...modelValue.value, name: value };
  },
});

const url = computed({
  get: () => modelValue.value?.url,
  set: (value) => {
    modelValue.value = { ...modelValue.value, url: value };
  },
});
</script>

<template>
  <div class="flex w-full items-start gap-3">
    <SfFormItem :label="$t('linkName')" class="min-w-0 flex-1">
      <SfInput v-model="name" :placeholder="$t('websiteExample')" />
    </SfFormItem>
    <SfFormItem :label="$t('linkAddress')" class="min-w-0 flex-1">
      <SfInput v-model="url" placeholder="如 https://example.com" />
    </SfFormItem>
  </div>
</template>

<style lang="scss" scoped></style>
