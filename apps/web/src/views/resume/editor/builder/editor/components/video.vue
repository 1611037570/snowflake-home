<script setup>
import { getCurrentInstance } from "vue";

const name = defineModel("name", {
  type: String,
  default: "",
});
const url = defineModel("url", {
  type: String,
  default: "",
});
const desc = defineModel("desc", {
  type: String,
  default: "",
});
</script>

<template>
  <div class="flex w-full flex-col gap-1">
    <div class="flex items-center gap-3">
      <div class="w-[100px] min-w-0">
        <SfFormItem :label="$t('videoName')" prop="url">
          <SfInput v-model="name" :placeholder="$t('videoNamePlaceholder')" />
        </SfFormItem>
      </div>
      <div class="min-w-0 flex-1">
        <SfFormItem :label="$t('videoLink')" prop="url">
          <SfInput v-model="url" :placeholder="$t('videoLinkPlaceholder')" />
        </SfFormItem>
      </div>
    </div>
    <SfFormItem :label="$t('videoIntro')" prop="desc">
      <SfInput v-model="desc" :placeholder="$t('videoIntroPlaceholder')" />
    </SfFormItem>
  </div>
</template>

<style lang="scss" scoped></style>
