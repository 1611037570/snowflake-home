<script setup>
import ItemCollapse from "./itemCollapse.vue";
// 学校
const name = defineModel("name", {
  type: String,
  default: "",
});
defineProps({
  add: {},
  containerTitle: {},
});
// 学位列表
const educationList = [
  {
    name: "高中",
    value: "高中",
  },
  {
    name: "大专",
    value: "大专",
  },
  {
    name: "本科",
    value: "本科",
  },
  {
    name: "硕士",
    value: "硕士",
  },
  {
    name: "博士",
    value: "博士",
  },
];
// 学位
const education = defineModel("education", {
  type: String,
  default: "",
});
// 经历
const content = defineModel("content", {
  type: String,
  default: "",
});
// 专业
const post = defineModel("post", {
  type: String,
  default: "",
});
// 时间
const time = defineModel("time", {
  type: Array,
  default: () => [],
});
const title = computed(() => {
  return name.value ? name.value : "未填写学校名称";
});

const mode = defineModel("mode", {
  type: String,
  default: "",
});

const modeList = [
  {
    name: "全日制",
    value: "全日制",
  },
  {
    name: "非全日制",
    value: "非全日制",
  },
  {
    name: "不填写",
    value: " ",
  },
];
const currentIndex = inject("df/current/index");
</script>

<template>
  <ItemCollapse :title="title" :index="currentIndex" :add="add" :containerTitle="containerTitle">
    <div class="flex flex-col gap-3">
      <div class="flex w-full gap-3">
        <div class="flex-1">
          <SfInput placeholder="学校" v-model="name" clearable />
        </div>
        <SfSelect placeholder="学位" v-model="education" :list="educationList" />
      </div>
      <div class="flex w-full gap-3">
        <div class="flex-1">
          <SfInput placeholder="专业" v-model="post" clearable />
        </div>
        <SfSelect placeholder="学制" v-model="mode" :list="modeList" />
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
      </div>

      <SfWangEditor v-model="content"></SfWangEditor>
    </div>
  </ItemCollapse>
</template>

<style lang="scss" scoped></style>
