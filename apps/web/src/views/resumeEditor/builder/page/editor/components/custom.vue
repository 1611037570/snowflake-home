<script setup>
import ItemCollapse from "./itemCollapse.vue";
const name = defineModel("name", {
  type: String,
  default: "",
});
defineProps({
  add: {},
  containerTitle: {},
});
const title = computed(() => {
  return name.value ? name.value : "未填写名称";
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
const { currentIndex } = inject("df/context");
</script>

<template>
  <ItemCollapse :title="title" :index="currentIndex" :add="add" :containerTitle="containerTitle">
    <div class="flex flex-col gap-3">
      <div class="flex w-full gap-3">
        <SfFormItem label="名称">
          <SfInput placeholder="名称" v-model="name" />
        </SfFormItem>
        <SfFormItem label="职位">
          <SfInput placeholder="职位" v-model="post" />
        </SfFormItem>
      </div>
      <div class="flex w-full gap-3">
        <SfFormItem label="时间">
          <SfDatePicker
            type="monthrange"
            placeholder="时间"
            v-model="time"
            format="YYYY.MM"
            value-format="YYYY.MM"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </SfFormItem>
      </div>
      <SfFormItem label="经历">
        <SfWangEditor v-model="content"></SfWangEditor>
      </SfFormItem>
    </div>
  </ItemCollapse>
</template>

<style lang="scss" scoped></style>
