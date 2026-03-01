<script setup>
// 学校
const school = defineModel('school', {
  type: String,
  default: '',
})
// 学位列表
const degreeList = [
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
const degree = defineModel('degree', {
  type: String,
  default: '',
})
// 经历
const experience = defineModel('experience', {
  type: String,
  default: '',
})
// 专业
const major = defineModel('major', {
  type: String,
  default: '',
})
const title = computed(() => {
  return school.value ? school.value : '未填写学校名称'
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
          <SfInput placeholder="学校" v-model="school" />
          <SfSelect placeholder="学位" v-model="degree" :list="degreeList" />
        </div>
        <div class="flex w-full gap-3">
          <SfSelect placeholder="学位" v-model="degree" :list="degreeList" />
          <SfInput placeholder="专业" v-model="major" />
        </div>
        <SfWangEdit v-model="experience"></SfWangEdit>
      </div>
    </SfCollapseItem>
  </SfCollapse>
</template>

<style lang="scss" scoped></style>
