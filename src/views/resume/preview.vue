<script setup></script>

<template>
  <div
    class="flex h-[1000px] w-[740px] flex-col rounded-lg bg-white p-4 shadow-md transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
  >
    <div class="flex flex-1 flex-col">
      <!-- 信息模块 -->
      <div class="mb-6 flex items-center justify-between">
        <div class="flex-1">
          <div class="mr-3 text-xl font-bold">小羊</div>
          <div class="flex flex-col text-sm">
            <div>男|25岁 电话：15878892637 邮箱1611037570@qq.com</div>
            <div>3年工作经验</div>
          </div>
        </div>
        <div class="flex flex-col text-sm">
          <div class="flex flex-col">
            <div class="h-10 w-10" style="background: red"></div>
            <div>稀土掘金</div>
            <div class="text-[8px]">https://juejin.cn/user/2342386827791687/posts</div>
          </div>
          <div class="flex flex-col">
            <div class="h-10 w-10" style="background: red"></div>
            <div>github</div>
            <div class="text-[8px]">https://github.com/1611037570</div>
          </div>
        </div>
      </div>
      <!-- 教育经验 -->
      <div class="mb-6 flex flex-col">
        <div class="mb-2 text-lg font-bold">教育经历</div>
        <div class="mb-2 flex items-center justify-between pb-2">
          <div>
            <span class="font-medium"> 柳州工学院 </span>
            全日制本科 计算机科学与技术
          </div>
          <div>2021-2023</div>
        </div>
      </div>
      <!-- 专业技能 -->
      <div>
        <div class="my-2 text-lg font-bold">专业技能</div>
        <div>
          <div>HTML/CSS</div>
          <div>JavaScript</div>
          <div>Vue.js</div>
          <div>React</div>
        </div>
      </div>
      <!-- 工作经历 -->
      <div>
        <div class="my-2 text-lg font-bold">工作经历</div>

        <div class="flex items-center justify-between">
          <span class="font-medium"> 公司A </span>
          前端开发工程师 2023.03-2024.06
        </div>
      </div>
      <div>
        <!-- 个人项目经历 -->
        <div>
          <div class="my-2 text-lg font-bold">个人项目经历</div>
          <div class="flex items-center justify-between">
            <span class="font-medium"> 简历生成器 </span>
            独立开发 2023.03-2024.06
          </div>
          <div>项目描述：此简历由本项目制作。</div>
        </div>
        <!-- 工作项目经历 -->
        <div>
          <div class="my-2 text-lg font-bold">工作项目经历</div>
          <div class="flex items-center justify-between">
            <span class="font-medium"> 公司A </span>
            前端开发工程师 2023.03-2024.06
          </div>
        </div>
      </div>
    </div>
    <div class="mt-auto text-center text-xs">第 1 页，共 1 页</div>
  </div>
</template>

<style scoped></style>
