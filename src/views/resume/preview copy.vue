<script setup>
import { onMounted, ref } from 'vue'

// 简历数据
const resumeData = {
  basicInfo: {
    name: '小羊',
    gender: '男',
    age: 25,
    phone: '15878892637',
    email: '1611037570@qq.com',
    experience: '3年工作经验',
  },
  education: [
    {
      school: '柳州工学院',
      degree: '全日制本科',
      major: '计算机科学与技术',
      period: '2021-2023',
    },
  ],
  skills: [
    'HTML/CSS',
    'JavaScript',
    'Vue.js',
    'React',
    'TypeScript',
    'Node.js',
    'Webpack',
    'Tailwind CSS',
  ],
  workExperience: [
    {
      company: '公司A',
      position: '前端开发工程师',
      period: '2023.03-2024.06',
      description: '负责公司核心产品的前端开发，参与需求分析、技术选型、架构设计等工作。',
    },
    {
      company: '公司B',
      position: '初级前端开发',
      period: '2022.01-2023.02',
      description: '参与项目的前端开发和维护，负责页面组件的实现和优化。',
    },
  ],
  projectExperience: [
    {
      name: '企业管理系统',
      role: '前端开发工程师',
      period: '2023.03-2024.06',
      description:
        '使用Vue.js和Element Plus开发的企业内部管理系统，包括用户管理、权限控制、数据统计等模块。',
    },
    {
      name: '电商网站重构',
      role: '前端开发',
      period: '2022.01-2023.02',
      description: '负责电商网站的前端重构工作，优化用户体验和页面性能。',
    },
    {
      name: '移动端应用',
      role: '前端开发',
      period: '2021.07-2021.12',
      description: '使用React Native开发的移动端应用，实现了数据展示、用户交互等功能。',
    },
  ],
}

// 页面数据分组
const pages = ref([])

// 初始化分页
const initPagination = () => {
  // 模拟分页逻辑 - 实际项目中可以根据内容高度动态计算
  const page1 = {
    basicInfo: resumeData.basicInfo,
    education: resumeData.education,
    skills: resumeData.skills.slice(0, 4),
    workExperience: [resumeData.workExperience[0]],
  }

  const page2 = {
    workExperience: [resumeData.workExperience[1]],
    projectExperience: resumeData.projectExperience,
    skills: resumeData.skills.slice(4),
  }

  pages.value = [page1, page2]
}

onMounted(() => {
  initPagination()
})
</script>

<template>
  <div class="flex flex-wrap gap-6 bg-gray-100 p-4">
    <!-- 生成多个页面 -->
    <div
      v-for="(page, index) in pages"
      :key="index"
      class="flex h-[1000px] w-[740px] flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-md transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
    >
      <!-- 基本信息 -->
      <div v-if="page.basicInfo" class="mb-6 flex items-center">
        <div class="mr-3 text-xl font-bold text-blue-600">{{ page.basicInfo.name }}</div>
        <div class="flex flex-col text-sm">
          <div>
            {{ page.basicInfo.gender }}|{{ page.basicInfo.age }}岁 电话：{{
              page.basicInfo.phone
            }}
            邮箱{{ page.basicInfo.email }}
          </div>
          <div>{{ page.basicInfo.experience }}</div>
        </div>
      </div>

      <!-- 教育经历 -->
      <div v-if="page.education && page.education.length > 0" class="mb-6 flex flex-col">
        <div class="mb-2 text-lg font-bold text-blue-600">教育经历</div>
        <div
          v-for="(edu, eduIndex) in page.education"
          :key="eduIndex"
          class="mb-2 flex items-center justify-between border-b border-gray-100 pb-2"
        >
          <div>
            <span class="font-medium text-blue-500 transition-colors hover:text-blue-700">
              {{ edu.school }}
            </span>
            {{ edu.degree }} {{ edu.major }}
          </div>
          <div>{{ edu.period }}</div>
        </div>
      </div>

      <!-- 专业技能 -->
      <div v-if="page.skills && page.skills.length > 0" class="mb-6">
        <div class="mb-2 text-lg font-bold text-blue-600">专业技能</div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="(skill, skillIndex) in page.skills"
            :key="skillIndex"
            class="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700 transition-colors hover:bg-blue-100"
          >
            {{ skill }}
          </div>
        </div>
      </div>

      <!-- 工作经历 -->
      <div v-if="page.workExperience && page.workExperience.length > 0" class="mb-6">
        <div class="mb-2 text-lg font-bold text-blue-600">工作经历</div>
        <div v-for="(work, workIndex) in page.workExperience" :key="workIndex" class="mb-4">
          <div class="mb-1 flex items-center justify-between">
            <span class="font-medium text-blue-500 transition-colors hover:text-blue-700">
              {{ work.company }}
            </span>
            {{ work.position }} {{ work.period }}
          </div>
          <div v-if="work.description" class="ml-2 text-sm text-gray-600">
            {{ work.description }}
          </div>
        </div>
      </div>

      <!-- 项目经历 -->
      <div v-if="page.projectExperience && page.projectExperience.length > 0">
        <div class="mb-2 text-lg font-bold text-blue-600">项目经历</div>
        <div
          v-for="(project, projectIndex) in page.projectExperience"
          :key="projectIndex"
          class="mb-4"
        >
          <div class="mb-1 flex items-center justify-between">
            <span class="font-medium text-blue-500 transition-colors hover:text-blue-700">
              {{ project.name }}
            </span>
            {{ project.role }} {{ project.period }}
          </div>
          <div v-if="project.description" class="ml-2 text-sm text-gray-600">
            {{ project.description }}
          </div>
        </div>
      </div>

      <!-- 页码标识 -->
      <div class="mt-auto text-center text-xs text-gray-400">
        第 {{ index + 1 }} 页，共 {{ pages.length }} 页
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式增强 */
.flex-wrap {
  display: flex;
  flex-wrap: wrap;
}

.gap-6 > * {
  margin-right: 24px;
  margin-bottom: 24px;
}

/* 优化打印样式 */
@media print {
  .flex-wrap {
    display: block;
  }

  .flex-wrap > * {
    page-break-before: always;
    margin-right: 0;
    margin-bottom: 0;
    box-shadow: none;
  }

  .flex-wrap > *:first-child {
    page-break-before: avoid;
  }
}
</style>
