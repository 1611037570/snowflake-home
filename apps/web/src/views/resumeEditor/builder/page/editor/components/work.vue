<script setup>
import ItemCollapse from "./itemCollapse.vue";
import { DF_CURRENT_INDEX } from "@/components/business/dynamicForm/code/injectionKeys";
// 公司
const name = defineModel("name", {
  type: String,
  default: "",
});
defineProps({
  add: {},
  containerTitle: {},
});
const title = computed(() => {
  return name.value ? name.value : "未填写公司名称";
});
// 岗位
const post = defineModel("post", {
  type: String,
  default: "",
});
// 内容
const content = defineModel("content", {
  type: String,
  default: "",
});
// 时间
const time = defineModel("time", {});
const currentIndex = inject(DF_CURRENT_INDEX);
</script>

<template>
  <ItemCollapse :title="title" :index="currentIndex" :add="add" :containerTitle="containerTitle">
    <div class="flex flex-col gap-3">
      <div class="flex w-full gap-3">
        <SfInput placeholder="公司" v-model="name" />
        <SfInput placeholder="岗位" v-model="post" />
      </div>
      <div class="flex w-full gap-3">
        <SfDatePicker
          type="monthrange"
          placeholder="时间"
          v-model="time"
          format="YYYY.MM"
          value-format="YYYY.MM"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
        <div class="w-full"></div>
      </div>
      <SfWangEditor v-model="content"></SfWangEditor>
    </div>
  </ItemCollapse>
</template>

<style lang="scss" scoped></style>
