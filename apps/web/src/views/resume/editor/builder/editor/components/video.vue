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
        <SfFormItem label="链接" prop="url">
          <SfInput v-model="name" placeholder="视频名称" />
        </SfFormItem>
      </div>
      <div class="min-w-0 flex-1">
        <SfFormItem label="线上链接" prop="url">
          <SfInput v-model="url" placeholder="视频链接" />
        </SfFormItem>
      </div>
    </div>
    <SfFormItem label="介绍" prop="desc">
      <SfInput v-model="desc" placeholder="视频介绍" />
    </SfFormItem>
  </div>
</template>

<style lang="scss" scoped></style>
