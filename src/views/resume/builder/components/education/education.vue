<script setup>
// 学校
const name = defineModel('name', {
  type: String,
  default: '',
})
// 学位列表
const educationList = [
  {
    name: '高中',
    value: '高中',
  },
  {
    name: '大专',
    value: '大专',
  },
  {
    name: '本科',
    value: '本科',
  },
  {
    name: '硕士',
    value: '硕士',
  },
  {
    name: '博士',
    value: '博士',
  },
]
// 学位
const education = defineModel('education', {
  type: String,
  default: '',
})
// 经历
const content = defineModel('content', {
  type: String,
  default: '',
})
// 专业
const post = defineModel('post', {
  type: String,
  default: '',
})
// 时间
const time = defineModel('time', {
  type: Array,
  default: () => [],
})
const title = computed(() => {
  return name.value ? name.value : '未填写学校名称'
})
</script>

<template>
  <SfCollapse>
    <SfCollapseItem title="教育经历">
      <div class="flex flex-col gap-4">
        <div>
          <div class="flex items-center">
            <SfIcon size="4" class="mr-1" />
            {{ title }}
          </div>
        </div>
        <div class="flex w-full gap-3">
          <SfInput placeholder="学校" v-model="name" />
          <SfSelect placeholder="学位" v-model="education" :list="educationList" />
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
          <SfInput placeholder="专业" v-model="post" />
        </div>
        <SfWangEdit v-model="content"></SfWangEdit>
      </div>
    </SfCollapseItem>
  </SfCollapse>
</template>

<style lang="scss" scoped></style>
