<script setup>
import ItemCollapse from './itemCollapse.vue'

// 公司
const name = defineModel('name', {
  type: String,
  default: '',
})
const title = computed(() => {
  return name.value ? name.value : '未填写公司名称'
})
// 岗位
const post = defineModel('post', {
  type: String,
  default: '',
})
// 内容
const content = defineModel('content', {
  type: String,
  default: '',
})
// 时间
const time = defineModel('time', {})
</script>

<template>
  <ItemCollapse :title="title">
    <div class="flex flex-col gap-4">
      <div class="flex w-full gap-3">
        <SfInput placeholder="公司" v-model="name" />
        <SfInput placeholder="岗位" v-model="post" />
      </div>
      <div class="flex w-full gap-3">
        <SfDatePicker
          type="daterange"
          placeholder="时间"
          v-model="time"
          value-format="YYYY.MM.DD"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
        <div class="w-full"></div>
      </div>
      <SfWangEdit v-model="content"></SfWangEdit>
    </div>
  </ItemCollapse>
</template>

<style lang="scss" scoped></style>
