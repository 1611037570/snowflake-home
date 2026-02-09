<script setup>
import ResumePage from './page.vue'
import ScaleContainer from './ScaleContainer.vue'
const workList = {
  // 公司名
  company: '浙江嘉兴想天信息有限公司',
  // 开始工作时间
  startWorkTime: '2023.5',
  // 结束工作时间
  endWorkTime: '2024.2',

  content: [
    {
      time: '2023.5-2024.2',
      content:
        '参与短说社区及工作台的日常功能开发与系统维护，优化用户体验并提升系统稳定性，支持平台日均数百万用户的稳定访问。',
    },
    {
      time: '2024.3-2025.2',
      content:
        '主导短说社区5.0版本重构工作，推动组件化架构落地，提升代码复用率与开发效率，缩短新功能开发周期约30%。',
    },
    {
      time: '2025.2-2026.4',
      content: '负责社区6.0版本实现AI Agent在前端的落地应用，从前端交互到后端接口的全流程开发。',
    },
  ],
}
const user = {
  name: '小羊',
  sex: '男',
  age: 25,
  exp: '3',
  phone: '15878892637',
  email: '1611037570@qq.com',
  link: [
    {
      name: '稀土掘金',
      url: 'https://juejin.cn/user/2342386827791687/posts',
    },
    {
      name: 'github',
      url: 'https://github.com/1611037570',
    },
  ],
}

const paddingList = [
  {
    name: '紧凑',
    value: 'p-3',
  },
  {
    name: '适中',
    value: 'p-5',
  },
  {
    name: '宽松',
    value: 'p-8',
  },
]

const paddingValue = ref(paddingList[1].value)
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="z-10 flex items-center justify-end border-b border-sf-border bg-white p-2">
      <SfSelect
        :list="paddingList"
        placeholder="请选择间距"
        class="w-[100px]"
        v-model="paddingValue"
      />
    </div>
    <ScaleContainer class="min-h-0 w-full flex-1">
      <ResumePage :user="user" :workList="workList" :paddingClass="paddingValue" />
    </ScaleContainer>
  </div>
</template>

<style scoped></style>
