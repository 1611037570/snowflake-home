<script setup>
import Educational from './educational.vue'
import Skill from './skill.vue'
import User from './user.vue'

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
  <SfSelect :list="paddingList" placeholder="请选择间距" class="w-[100px]" v-model="paddingValue" />
  <div
    class="flex h-[1123px] w-[794px] flex-col rounded-lg bg-white text-sf-primary"
    style="zoom: 0.8"
    :class="paddingValue"
  >
    <div class="flex flex-1 flex-col text-sm">
      <!-- 信息模块 -->
      <User :data="user" />
      <!-- 教育经历 -->
      <Educational />

      <!-- 专业技能 -->
      <Skill />

      <div v-if="workList" class="flex flex-col">
        <div class="mb-3 text-lg font-bold">工作经历</div>
        <div class="mb-3 flex items-center justify-between">
          {{ workList.company }}
          <div class="flex items-center">
            {{ workList.startWorkTime }}-{{ workList.endWorkTime }}
          </div>
        </div>
        <div v-for="item in workList.content" :key="item.time" class="text-[12px]">
          {{ item.time }}：{{ item.content }}
        </div>
      </div>
      <!-- 工作经历 -->
      <div>
        <div class="mb-3 text-lg font-bold">项目经历</div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="text-lg font-bold">短说社区</div>
            <div>前端开发工程师</div>
          </div>
          <div>2023.03-2024.06</div>
        </div>
      </div>
      <div>
        <!-- 个人项目经历 -->
        <!-- <div>
          <div class="my-2 text-lg font-bold">个人项目经历</div>
          <div class="flex items-center justify-between">
            <span class="font-medium"> 简历生成器 </span>
            独立开发 2023.03-2024.06
          </div>
          <div>项目描述：此简历由本项目制作。</div>
        </div> -->
        <!-- 工作项目经历 -->
        <!-- <div>
          <div class="my-2 text-lg font-bold">工作项目经历</div>
          <div class="flex items-center justify-between">
            <span class="font-medium"> 公司A </span>
            前端开发工程师 2023.03-2024.06
          </div>
        </div> -->
      </div>
    </div>
    <div class="mt-auto text-center text-xs">第 1 页，共 1 页</div>
  </div>
</template>

<style scoped></style>
